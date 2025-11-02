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
    return <div className="p-8 text-center text-pearl">Chargement...</div>;
  }

  if (!isAuthenticated || user?.role !== 'DIRECTOR') {
    return null;
  }

  return (
    <div className="p-8 text-pearl">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="font-display text-4xl font-bold text-gold">Gestion des utilisateurs</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-premium"
          >
            + Créer un utilisateur
          </button>
          <Link href="/admin" className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5">
            ← Retour
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 text-red-400 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-pearl/60">Chargement...</div>
      ) : (
        <div className="luxury-card rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gold/20">
            <thead className="glass">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Nom</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Conseiller</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-pearl">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl">
                    {u.firstname} {u.lastname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl/70">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'DIRECTOR' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' :
                      u.role === 'ADVISE' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' :
                      'bg-green-900/30 text-green-400 border border-green-500/30'
                    }`}>
                      {getRoleName(u.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-pearl/70">
                    {u.role === 'CLIENT' ? (
                      <div className="flex items-center space-x-2">
                        <span>{getAdvisorName(u.advisorId)}</span>
                        {u.advisorId && (
                          <button
                            onClick={() => handleRemoveAdvisor(u.id)}
                            className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-500/30 hover:border-red-500/50 transition-all"
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
                          className="text-gold hover:text-yellow-400 text-xs px-2 py-1 rounded border border-gold/30 hover:border-gold/50 transition-all"
                          title="Assigner/Changer de conseiller"
                        >
                          {u.advisorId ? 'Modifier' : 'Assigner'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-pearl/30">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.banned ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/30">Banni</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400 border border-green-500/30">Actif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {u.banned ? (
                      <button
                        onClick={() => handleUnban(u.id)}
                        className="text-green-400 hover:text-green-300 px-3 py-1 rounded border border-green-500/30 hover:border-green-500/50 transition-all"
                      >
                        Débannir
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBan(u.id)}
                        className="text-yellow-400 hover:text-yellow-300 px-3 py-1 rounded border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                      >
                        Bannir
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded border border-red-500/30 hover:border-red-500/50 transition-all"
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

      {/* Modal création utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-3xl font-bold mb-6 text-gold text-center">Créer un utilisateur</h2>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Mot de passe</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-premium w-full"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-premium w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-2">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="input-premium w-full"
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
                  className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal assignation conseiller */}
      {showAssignModal && selectedClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass border border-gold/30 rounded-xl p-8 max-w-md w-full">
            <h2 className="font-display text-3xl font-bold mb-4 text-gold text-center">
              Assigner un conseiller
            </h2>
            <p className="text-center text-pearl/70 mb-6">
              à {selectedClient.firstname} {selectedClient.lastname}
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gold mb-2">
                  Sélectionner un conseiller
                </label>
                <select
                  id="advisorSelect"
                  className="input-premium w-full"
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
                className="px-6 py-2 text-pearl/70 hover:text-pearl border border-pearl/20 hover:border-gold/40 rounded-lg transition-all duration-300 hover:bg-gold/5"
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
                className="btn-premium"
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
