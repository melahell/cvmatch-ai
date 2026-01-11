"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";

export default function ProfilPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    useEffect(() => {
        const storedId = Cookies.get("userId");
        if (!storedId) {
            router.push("/login");
        } else {
            setUserId(storedId);
        }
    }, [router]);

    const handleResetRAG = async () => {
        if (confirmText !== "REINITIALISER") {
            alert("Veuillez taper REINITIALISER pour confirmer");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/rag/reset", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                alert("✅ Votre profil RAG a été réinitialisé avec succès.");
                router.push("/onboarding");
            } else {
                const data = await response.json();
                alert(`❌ Erreur: ${data.error}`);
            }
        } catch (error) {
            alert("❌ Une erreur est survenue");
        } finally {
            setLoading(false);
            setShowResetModal(false);
            setConfirmText("");
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== "SUPPRIMER") {
            alert("Veuillez taper SUPPRIMER pour confirmer");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                // Supprimer les cookies
                Cookies.remove("userId");
                Cookies.remove("userName");

                // Rediriger vers page de confirmation
                router.push("/goodbye");
            } else {
                const data = await response.json();
                alert(`❌ Erreur: ${data.error}`);
            }
        } catch (error) {
            alert("❌ Une erreur est survenue");
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
            setConfirmText("");
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Mon Profil RAG</h1>
            <p className="text-slate-500 mb-8">Gérez vos données et paramètres</p>

            {/* ZONE DANGEREUSE */}
            <Card className="border-red-200 bg-red-50/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <CardTitle className="text-red-600">Zone dangereuse</CardTitle>
                    </div>
                    <CardDescription>
                        Actions irréversibles qui suppriment vos données
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* RÉINITIALISER LE PROFIL RAG */}
                    <div className="border-b border-red-100 pb-6">
                        <h3 className="font-semibold text-slate-900 mb-2">
                            🔄 Réinitialiser le profil RAG
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                            Cette action supprimera :
                        </p>
                        <ul className="text-sm text-red-600 space-y-1 mb-4 ml-4">
                            <li>• Tous vos documents uploadés</li>
                            <li>• Toutes les données RAG extraites</li>
                            <li>• Toutes les pondérations personnalisées</li>
                            <li>• Toutes vos notes personnelles</li>
                        </ul>
                        <p className="text-xs text-slate-500 mb-4">
                            ℹ️ Vos analyses de jobs et CVs générés seront conservés. Votre compte reste actif.
                        </p>
                        <Button
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            onClick={() => setShowResetModal(true)}
                        >
                            Réinitialiser tout le profil
                        </Button>
                    </div>

                    {/* SUPPRIMER LE COMPTE */}
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-2">
                            🗑️ Supprimer mon compte définitivement
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                            Supprime votre compte ET toutes vos données (RGPD Article 17 - Droit à l'oubli).
                        </p>
                        <p className="text-sm text-red-600 font-medium mb-4">
                            ⚠️ Cette action est IRRÉVERSIBLE et ne peut pas être annulée.
                        </p>
                        <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-xs font-semibold text-slate-700 mb-2">
                                Sera supprimé définitivement :
                            </p>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>✓ Votre compte utilisateur</li>
                                <li>✓ Tous vos documents uploadés</li>
                                <li>✓ Votre profil RAG complet</li>
                                <li>✓ Toutes vos analyses de jobs</li>
                                <li>✓ Tous vos CVs générés</li>
                                <li>✓ Toutes vos données analytics</li>
                            </ul>
                        </div>
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Supprimer mon compte et mes données
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* MODALE DE CONFIRMATION - RÉINITIALISER RAG */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">⚠️ Confirmer la Réinitialisation</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Vous êtes sur le point de réinitialiser votre profil RAG.
                            Cette action supprimera tous vos documents et données RAG.
                        </p>
                        <p className="text-sm font-medium mb-3">
                            Pour confirmer, tapez: <span className="font-mono font-bold">REINITIALISER</span>
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 mb-4"
                            placeholder="Tapez REINITIALISER"
                            disabled={loading}
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowResetModal(false);
                                    setConfirmText("");
                                }}
                                disabled={loading}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleResetRAG}
                                disabled={loading || confirmText !== "REINITIALISER"}
                                className="flex-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    "Confirmer"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODALE DE CONFIRMATION - SUPPRIMER COMPTE */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-red-600">
                            ⚠️ Confirmer la Suppression Définitive
                        </h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Vous êtes sur le point de supprimer définitivement votre compte
                            et TOUTES vos données. Cette action est IRRÉVERSIBLE.
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                            <p className="text-xs font-semibold text-red-800">
                                ⚠️ ATTENTION : Après cette action, vous ne pourrez plus :
                            </p>
                            <ul className="text-xs text-red-700 mt-2 space-y-1">
                                <li>• Accéder à votre compte</li>
                                <li>• Récupérer vos documents</li>
                                <li>• Restaurer vos analyses</li>
                            </ul>
                        </div>
                        <p className="text-sm font-medium mb-3">
                            Pour confirmer, tapez: <span className="font-mono font-bold">SUPPRIMER</span>
                        </p>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="w-full border border-red-300 rounded px-3 py-2 mb-4 focus:border-red-500 focus:ring-red-500"
                            placeholder="Tapez SUPPRIMER"
                            disabled={loading}
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setConfirmText("");
                                }}
                                disabled={loading}
                                className="flex-1"
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={loading || confirmText !== "SUPPRIMER"}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    "Supprimer Définitivement"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
