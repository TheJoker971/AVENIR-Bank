/**
 * Page de gestion des utilisateurs (Directeur)
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/presentation/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserApiAdapter } from '@/infrastructure/api/UserApiAdapter';
import { UserDto } from '@/shared/dto';
import { UserServiceInterface, CreateUserData } from '@/application/services/UserService';

const userService: UserServiceInterface = new UserApiAdapter();

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserDto[]>([]);
  const [advisors, setAdvisors] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UserDto | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    address: '',
    role: 'CLIENT',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'DIRECTOR')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.role === 'DIRECTOR') {
      loadUsers();
      loadAdvisors();
    }
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    const result = await userService.getAllUsers();
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setUsers(result);
    }
    
    setLoading(false);
  };

  const loadAdvisors = async () => {
    const result = await userService.getUsersByRole('ADVISE');
    if (!(result instanceof Error)) {
      setAdvisors(result);
    }
  };

  const handleBan = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;
    
    const result = await userService.banUser(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadUsers();
    }
  };

  const handleUnban = async (userId: number) => {
    const result = await userService.unbanUser(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadUsers();
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;
    
    const result = await userService.deleteUser(userId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadUsers();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const result = await userService.createUser(formData);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setShowCreateModal(false);
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        address: '',
        role: 'CLIENT',
      });
      await loadUsers();
      if (formData.role === 'ADVISE') {
        await loadAdvisors();
      }
    }
  };

  const handleAssignAdvisor = async (clientId: number, advisorId: number) => {
    setError(null);
    const result = await userService.assignAdvisorToClient(clientId, advisorId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      setShowAssignModal(false);
      setSelectedClient(null);
      await loadUsers();
    }
  };

  const handleRemoveAdvisor = async (clientId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer le conseiller de ce client ?')) return;
    setError(null);
    const result = await userService.removeAdvisorFromClient(clientId);
    if (result instanceof Error) {
      setError(result.message);
    } else {
      await loadUsers();
    }
  };

  const getAdvisorName = (advisorId: number | null | undefined): string => {
    if (!advisorId) return 'Aucun';
    const advisor = advisors.find(a => a.id === advisorId);
    return advisor ? `${advisor.firstname} ${advisor.lastname}` : 'Inconnu';
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'Client';
      case 'ADVISE': return 'Conseiller';
      case 'DIRECTOR': return 'Directeur';
      default: return role;
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Créer un utilisateur
          </button>
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            ← Retour
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conseiller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {u.firstname} {u.lastname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      u.role === 'DIRECTOR' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'ADVISE' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getRoleName(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.role === 'CLIENT' ? (
                      <div className="flex items-center space-x-2">
                        <span>{getAdvisorName(u.advisorId)}</span>
                        {u.advisorId && (
                          <button
                            onClick={() => handleRemoveAdvisor(u.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Retirer le conseiller"
                          >
                            ✕
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedClient(u);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Assigner/Changer de conseiller"
                        >
                          {u.advisorId ? 'Modifier' : 'Assigner'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.banned ? (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Banni</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Actif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {u.banned ? (
                      <button
                        onClick={() => handleUnban(u.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Débannir
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(u.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        Bannir
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Créer un utilisateur</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="CLIENT">Client</option>
                    <option value="ADVISE">Conseiller</option>
                    <option value="DIRECTOR">Directeur</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Assigner un conseiller à {selectedClient.firstname} {selectedClient.lastname}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un conseiller
                </label>
                <select
                  id="advisorSelect"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue={selectedClient.advisorId?.toString() || ''}
                >
                  <option value="">Aucun conseiller</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.firstname} {advisor.lastname} ({advisor.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedClient(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const selectElement = document.getElementById('advisorSelect') as HTMLSelectElement;
                  const advisorId = selectElement.value ? parseInt(selectElement.value) : null;
                  
                  if (advisorId) {
                    await handleAssignAdvisor(selectedClient.id, advisorId);
                  } else {
                    await handleRemoveAdvisor(selectedClient.id);
                    setShowAssignModal(false);
                    setSelectedClient(null);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {selectedClient.advisorId ? 'Modifier' : 'Assigner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

