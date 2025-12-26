export default function Home() {
    return (
          <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
                <header className="container mx-auto px-4 py-6">
                        <nav className="flex justify-between items-center">
                                  <div className="text-2xl font-bold text-blue-600">CVMatch AI</div>div>
                                  <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                              Se connecter
                                  </a>a>
                        </nav>nav>
                </header>header>
                
                <section className="container mx-auto px-4 py-20 text-center">
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  Ton CV parfait en 20 secondes
                        </h1>h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                  L'IA qui génère le CV optimal pour chaque offre d'emploi.
                                  Analyse de match, optimisation ATS, et génération automatique.
                        </p>p>
                        <a href="/signup" className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition">
                                  Commencer gratuitement →
                        </a>a>
                </section>section>
                
                <section className="container mx-auto px-4 py-16">
                        <div className="grid md:grid-cols-3 gap-8">
                                  <div className="p-6 bg-white rounded-xl shadow-lg">
                                              <div className="text-4xl mb-4">🎯</div>div>
                                              <h3 className="text-xl font-bold mb-2">Analyse de Match</h3>h3>
                                              <p className="text-gray-600">Score objectif entre ton profil et chaque offre d'emploi</p>p>
                                  </div>div>
                                  <div className="p-6 bg-white rounded-xl shadow-lg">
                                              <div className="text-4xl mb-4">📄</div>div>
                                              <h3 className="text-xl font-bold mb-2">CV Optimisé</h3>h3>
                                              <p className="text-gray-600">Génération automatique adaptée à chaque candidature</p>p>
                                  </div>div>
                                  <div className="p-6 bg-white rounded-xl shadow-lg">
                                              <div className="text-4xl mb-4">🚀</div>div>
                                              <h3 className="text-xl font-bold mb-2">Opportunités Cachées</h3>h3>
                                              <p className="text-gray-600">L'IA suggère des postes auxquels tu n'aurais pas pensé</p>p>
                                  </div>div>
                        </div>div>
                </section>section>
          </main>main>
        );
}</main>
