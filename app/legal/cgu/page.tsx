import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation - CV Crush",
    description: "Conditions Générales d'Utilisation de la plateforme CV Crush",
};

export default function CGUPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">
                    Conditions Générales d'Utilisation
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-500 mb-8">
                        Dernière mise à jour : Janvier 2024
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            1. Objet
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
                            de la plateforme CV Crush, un service d'analyse et d'optimisation de CV basé sur
                            l'intelligence artificielle.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            2. Description du Service
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            CV Crush propose les services suivants :
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Analyse de CV et extraction de compétences via IA</li>
                            <li>Comparaison CV / offre d'emploi avec score de matching</li>
                            <li>Génération de CV personnalisés adaptés aux offres</li>
                            <li>Suivi des candidatures</li>
                            <li>Recommandations d'amélioration de profil</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            3. Inscription et Compte
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Pour utiliser CV Crush, vous devez créer un compte en fournissant une adresse
                            email valide. Vous êtes responsable de la confidentialité de vos identifiants
                            de connexion.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Vous vous engagez à fournir des informations exactes et à maintenir votre
                            profil à jour.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            4. Propriété Intellectuelle
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            La plateforme CV Crush, son code source, son design et ses algorithmes sont
                            la propriété exclusive de CV Crush. Toute reproduction non autorisée est interdite.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Les documents que vous uploadez (CV, lettres de motivation) restent votre propriété.
                            Vous nous accordez une licence limitée pour les traiter dans le cadre du service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            5. Utilisation de l'IA
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            CV Crush utilise des modèles d'intelligence artificielle pour analyser vos documents
                            et générer des recommandations. Les résultats sont fournis à titre indicatif et ne
                            constituent pas des conseils professionnels. Nous ne garantissons pas l'obtention
                            d'un emploi suite à l'utilisation du service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            6. Responsabilités
                        </h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            CV Crush s'engage à fournir un service sécurisé et disponible. Cependant, nous ne
                            pouvons garantir un fonctionnement ininterrompu.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Vous êtes seul responsable de l'utilisation que vous faites des CV générés et
                            des informations que vous y incluez.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            7. Résiliation
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
                            La suppression entraîne la perte de toutes vos données. CV Crush se réserve le droit
                            de suspendre ou résilier un compte en cas de violation des présentes CGU.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            8. Modification des CGU
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            CV Crush peut modifier ces CGU à tout moment. Les utilisateurs seront informés
                            par email ou notification dans l'application. La poursuite de l'utilisation
                            du service vaut acceptation des nouvelles conditions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4">
                            9. Droit Applicable
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            Les présentes CGU sont régies par le droit français. Tout litige sera soumis
                            aux tribunaux compétents de Paris.
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
