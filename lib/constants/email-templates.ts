export const EMAIL_TEMPLATES = {
    followUp: {
        subject: "Suivi de candidature - {poste}",
        body: `Bonjour,

Je me permets de revenir vers vous concernant ma candidature pour le poste de {poste} au sein de {entreprise}.

Je reste très motivé(e) par cette opportunité et serais ravi(e) d'échanger avec vous sur mon profil.

Restant à votre disposition,
Cordialement`
    },

    thankYou: {
        subject: "Remerciements suite à notre entretien",
        body: `Bonjour,

Je tenais à vous remercier pour le temps que vous m'avez accordé lors de notre entretien hier concernant le poste de {poste}.

Notre échange a renforcé mon intérêt pour rejoindre {entreprise}.

Dans l'attente de votre retour,
Cordialement`
    },

    acceptance: {
        subject: "Acceptation de l'offre - {poste}",
        body: `Bonjour,

J'ai le plaisir de vous confirmer mon acceptation de votre offre pour le poste de {poste}.

Je me réjouis de rejoindre {entreprise} et contribuer à vos projets.

Cordialement`
    },

    decline: {
        subject: "Suite à votre proposition",
        body: `Bonjour,

Je vous remercie pour votre proposition concernant le poste de {poste}.

Après mûre réflexion, je ne pourrai malheureusement pas donner suite à cette opportunité.

Je vous souhaite bonne continuation,
Cordialement`
    }
};

export function fillTemplateTemplate(template: string, data: {
    poste?: string;
    entreprise?: string;
    [key: string]: any;
}): string {
    let filled = template;
    Object.entries(data).forEach(([key, value]) => {
        filled = filled.replace(new RegExp(`{${key}}`, 'g'), value || `[${key}]`);
    });
    return filled;
}
