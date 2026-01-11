export default function GoodbyePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center mx-4">
                <div className="text-6xl mb-6">✅</div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                    Votre compte a été supprimé
                </h1>

                <p className="text-slate-600 mb-6">
                    Toutes vos données ont été définitivement effacées de nos
                    serveurs conformément au RGPD (Article 17 - Droit à l'oubli).
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-700 mb-2">
                        <strong>Ce qui a été supprimé :</strong>
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 text-left">
                        <li>✓ Votre compte utilisateur</li>
                        <li>✓ Tous vos documents CV uploadés</li>
                        <li>✓ Votre profil RAG et analyses</li>
                        <li>✓ Tous vos CVs générés</li>
                        <li>✓ Toutes vos analyses de jobs</li>
                        <li>✓ Vos données analytics</li>
                    </ul>
                </div>

                <p className="text-sm text-slate-500 mb-6">
                    Nous sommes désolés de vous voir partir. Si vous avez des questions
                    ou souhaitez nous faire part de vos commentaires, n'hésitez pas à
                    nous contacter.
                </p>

                <div className="space-y-3">
                    <a
                        href="/"
                        className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Retour à l'accueil
                    </a>

                    <a
                        href="mailto:support@cvmatch.ai"
                        className="block text-sm text-blue-600 hover:underline"
                    >
                        Nous contacter
                    </a>
                </div>
            </div>
        </div>
    );
}
