#!/bin/bash

# Script pour faciliter les commits Git
# Usage: ./scripts/git-commit.sh "feat(module): message du commit"

COMMIT_MESSAGE="$1"
FILES_TO_ADD="${2:-.}"

if [ -z "$COMMIT_MESSAGE" ]; then
    echo "Usage: $0 \"message du commit\" [fichiers ou répertoire]"
    exit 1
fi

# Configurer git pour ne pas utiliser de pager
export GIT_PAGER=cat

# Ajouter les fichiers
git add $FILES_TO_ADD

# Faire le commit
git commit -m "$COMMIT_MESSAGE"

echo "✅ Commit créé: $COMMIT_MESSAGE"

