"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";

interface NotificationPrefs {
    emailNewMatch: boolean;
    emailReminder: boolean;
    emailNewsletter: boolean;
    pushEnabled: boolean;
}

export default function SettingsPage() {
    const { userName } = useAuth();
    const [saving, setSaving] = useState(false);
    const [prefs, setPrefs] = useState<NotificationPrefs>({
        emailNewMatch: true,
        emailReminder: true,
        emailNewsletter: false,
        pushEnabled: false,
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate save (TODO: implement actual API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        toast.success("Paramètres sauvegardés !");
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6 max-w-2xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Paramètres
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Gérez vos préférences et notifications
                    </p>
                </div>

                {/* Account Info */}
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Compte</CardTitle>
                        <CardDescription>Informations de votre compte</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-400">Nom</span>
                            <span className="font-medium text-slate-900 dark:text-white">{userName}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-400">Plan</span>
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-medium text-slate-700 dark:text-slate-300">
                                Gratuit
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Email Notifications */}
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Mail className="w-5 h-5" />
                            Notifications Email
                        </CardTitle>
                        <CardDescription>
                            Choisissez quels emails vous souhaitez recevoir
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Nouvelles offres matching
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Soyez alerté quand une offre correspond à votre profil (&gt;80%)
                                </p>
                            </div>
                            <Switch
                                checked={prefs.emailNewMatch}
                                onCheckedChange={(checked) => setPrefs({ ...prefs, emailNewMatch: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Rappels candidatures
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Rappels pour les candidatures sans réponse depuis 7 jours
                                </p>
                            </div>
                            <Switch
                                checked={prefs.emailReminder}
                                onCheckedChange={(checked) => setPrefs({ ...prefs, emailReminder: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Newsletter
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Conseils CV et actualités du marché (1x/semaine)
                                </p>
                            </div>
                            <Switch
                                checked={prefs.emailNewsletter}
                                onCheckedChange={(checked) => setPrefs({ ...prefs, emailNewsletter: checked })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Smartphone className="w-5 h-5" />
                            Notifications Push
                        </CardTitle>
                        <CardDescription>
                            Recevez des notifications sur cet appareil
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    Activer les notifications push
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Nécessite votre autorisation navigateur
                                </p>
                            </div>
                            <Switch
                                checked={prefs.pushEnabled}
                                onCheckedChange={(checked) => {
                                    if (checked && "Notification" in window) {
                                        Notification.requestPermission().then((permission) => {
                                            if (permission === "granted") {
                                                setPrefs({ ...prefs, pushEnabled: true });
                                                toast.success("Notifications activées !");
                                            } else {
                                                toast.error("Permission refusée");
                                            }
                                        });
                                    } else {
                                        setPrefs({ ...prefs, pushEnabled: false });
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-900 dark:bg-slate-900">
                    <CardHeader>
                        <CardTitle className="text-red-600">Zone de danger</CardTitle>
                        <CardDescription>
                            Actions irréversibles sur votre compte
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                        >
                            Supprimer mon compte
                        </Button>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Cette action supprimera définitivement toutes vos données
                        </p>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Sauvegarder
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}
