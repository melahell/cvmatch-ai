import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Politique de Confidentialité - CVMatch",
    description: "Politique de confidentialité et protection des données personnelles de CVMatch",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">
                    Politique de Confidentialité
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-500 mb-8">
                        Dernière mise à jour : Janvier 2024
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            1. Responsable du Traitement
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            CVMatch, représenté par son équipe fondatrice, est responsable du traitement
                            de vos données personnelles. Pour toute question, contactez-nous via notre
                            formulaire de contact.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            2. Données Collectées
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Nous collectons les données suivantes :
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Données d'identification</strong> : nom, prénom, email, photo de profil</li>
                            <li><strong>Données professionnelles</strong> : CV, expériences, compétences, formations</li>
                            <li><strong>Données d'utilisation</strong> : analyses effectuées, candidatures suivies</li>
                            <li><strong>Données techniques</strong> : adresse IP, type de navigateur, logs de connexion</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            3. Finalités du Traitement
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Vos données sont utilisées pour :
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Fournir le service d'analyse et de matching CV</li>
                            <li>Améliorer votre profil RAG et personnaliser les recommandations</li>
                            <li>Générer des CV adaptés aux offres d'emploi</li>
                            <li>Envoyer des notifications sur votre activité (si activées)</li>
                            <li>Améliorer nos algorithmes et la qualité du service</li>
                            <li>Répondre à vos demandes de support</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            4. Base Légale
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Le traitement de vos données repose sur votre consentement (lors de l'inscription),
                            l'exécution du contrat de service, et nos intérêts légitimes (amélioration du service,
                            sécurité).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            5. Partage des Données
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Nous partageons vos données uniquement avec :
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Supabase</strong> : hébergement base de données et stockage fichiers (UE)</li>
                            <li><strong>Vercel</strong> : hébergement de l'application (données de logs)</li>
                            <li><strong>OpenAI / Gemini</strong> : traitement IA pour l'analyse de CV (données anonymisées)</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            Nous ne vendons pas vos données à des tiers. Vos CV ne sont jamais partagés
                            avec des recruteurs sans votre consentement explicite.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            6. Conservation des Données
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Vos données sont conservées tant que votre compte est actif. Après suppression
                            de votre compte, vos données sont effacées sous 30 jours, sauf obligations légales
                            de conservation (3 ans pour les données de facturation).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            7. Vos Droits (RGPD)
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Conformément au RGPD, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
                            <li><strong>Droit de rectification</strong> : corriger vos informations</li>
                            <li><strong>Droit à l'effacement</strong> : supprimer votre compte et données</li>
                            <li><strong>Droit à la portabilité</strong> : exporter vos données en format standard</li>
                            <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
                            <li><strong>Droit de retrait du consentement</strong> : à tout moment</li>
                        </ul>
                        <p className="text-slate-600 leading-relaxed mt-4">
                            Pour exercer ces droits, contactez-nous via le formulaire de contact ou à
                            l'adresse : privacy@cvmatch.ai
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            8. Cookies
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            CVMatch utilise des cookies essentiels au fonctionnement du service (authentification,
                            préférences). Nous n'utilisons pas de cookies publicitaires ou de tracking tiers.
                            Vous pouvez désactiver les cookies dans votre navigateur, mais cela peut affecter
                            le fonctionnement du service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            9. Sécurité
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger
                            vos données : chiffrement en transit (HTTPS/TLS), authentification sécurisée,
                            accès restreint aux données, journalisation des accès.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            10. Réclamation
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Si vous estimez que le traitement de vos données viole vos droits, vous pouvez
                            introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique
                            et des Libertés) : www.cnil.fr
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <a
                            href="/dashboard"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            ← Retour au Dashboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
