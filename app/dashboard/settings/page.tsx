"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, Smartphone, Save, Loader2, User, Lock, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { createSupabaseClient, getSupabaseAuthHeader } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from "@/lib/utils/logger";

interface NotificationPrefs {
    emailNewMatch: boolean;
    emailReminder: boolean;
    emailNewsletter: boolean;
    pushEnabled: boolean;
}

interface UserProfile {
    full_name: string;
    job_title: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    email: string;
}

export default function SettingsPage() {
    const { userName } = useAuth();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile>({
        full_name: "",
        job_title: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        email: ""
    });

    // Password state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Billing state
    const [planLabel, setPlanLabel] = useState("Gratuit");
    const [subscriptionStatus, setSubscriptionStatus] = useState("inactive");
    const [billingLoading, setBillingLoading] = useState(false);

    // Prefs state
    const [prefs, setPrefs] = useState<NotificationPrefs>({
        emailNewMatch: true,
        emailReminder: true,
        emailNewsletter: false,
        pushEnabled: false,
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load Profile
                const authHeader = await getSupabaseAuthHeader();
                const profileRes = await fetch("/api/user/profile", {
                    headers: authHeader
                });
                
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile({
                        full_name: data.full_name || "",
                        job_title: data.job_title || "",
                        phone: data.phone || "",
                        location: data.location || "",
                        website: data.website || "",
                        linkedin: data.linkedin || "",
                        email: data.email || ""
                    });
                }

                const statsRes = await fetch("/api/admin/me", { headers: authHeader });
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    const tier = data.subscriptionTier || "free";
                    setPlanLabel(tier === "pro" ? "Pro" : tier === "team" ? "Team" : "Gratuit");
                    setSubscriptionStatus(data.subscriptionStatus || "inactive");
                }
            } catch (error) {
                logger.error("Error loading settings", { error, userId });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleProfileChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const authHeader = await getSupabaseAuthHeader();
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeader
                },
                body: JSON.stringify(profile)
            });

            if (!res.ok) throw new Error("Erreur sauvegarde");
            toast.success("Profil mis à jour !");
        } catch (error) {
            toast.error("Impossible de sauvegarder le profil");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }
        if (password.length < 6) {
            toast.error("Le mot de passe doit faire au moins 6 caractères");
            return;
        }

        setPasswordLoading(true);
        try {
            const supabase = createSupabaseClient();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            
            toast.success("Mot de passe modifié !");
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors du changement de mot de passe");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setBillingLoading(true);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: "pro" })
            });
            const data = await res.json();
            if (!res.ok || !data.url) {
                toast.error(data.error || "Impossible de démarrer le paiement");
                return;
            }
            window.location.href = data.url;
        } catch {
            toast.error("Erreur technique");
        } finally {
            setBillingLoading(false);
        }
    };

    const handleManageBilling = async () => {
        setBillingLoading(true);
        try {
            const res = await fetch("/api/billing/portal", { method: "POST" });
            const data = await res.json();
            if (!res.ok || !data.url) {
                toast.error(data.error || "Impossible d'ouvrir le portail");
                return;
            }
            window.location.href = data.url;
        } catch {
             toast.error("Erreur technique");
        } finally {
            setBillingLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
                    <p className="text-slate-600 dark:text-slate-400">Gérez vos informations et préférences</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile" className="flex items-center gap-2"><User className="w-4 h-4"/> Profil</TabsTrigger>
                        <TabsTrigger value="account" className="flex items-center gap-2"><Lock className="w-4 h-4"/> Sécurité</TabsTrigger>
                        <TabsTrigger value="billing" className="flex items-center gap-2"><CreditCard className="w-4 h-4"/> Abonnement</TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="w-4 h-4"/> Notifications</TabsTrigger>
                    </TabsList>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations Personnelles</CardTitle>
                                <CardDescription>Ces informations seront utilisées pour générer vos CVs</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nom complet</Label>
                                        <Input 
                                            value={profile.full_name} 
                                            onChange={(e) => handleProfileChange("full_name", e.target.value)} 
                                            placeholder="Jean Dupont"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Titre actuel</Label>
                                        <Input 
                                            value={profile.job_title} 
                                            onChange={(e) => handleProfileChange("job_title", e.target.value)} 
                                            placeholder="Développeur Fullstack"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input value={profile.email} disabled className="bg-slate-100" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Téléphone</Label>
                                        <Input 
                                            value={profile.phone} 
                                            onChange={(e) => handleProfileChange("phone", e.target.value)} 
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Localisation</Label>
                                        <Input 
                                            value={profile.location} 
                                            onChange={(e) => handleProfileChange("location", e.target.value)} 
                                            placeholder="Paris, France"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Site Web</Label>
                                        <Input 
                                            value={profile.website} 
                                            onChange={(e) => handleProfileChange("website", e.target.value)} 
                                            placeholder="https://mon-portfolio.com"
                                        />
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <Label>LinkedIn</Label>
                                        <Input 
                                            value={profile.linkedin} 
                                            onChange={(e) => handleProfileChange("linkedin", e.target.value)} 
                                            placeholder="https://linkedin.com/in/jeandupont"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Sauvegarde...</> : <><Save className="w-4 h-4 mr-2"/> Sauvegarder</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ACCOUNT TAB */}
                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mot de passe</CardTitle>
                                <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nouveau mot de passe</Label>
                                    <Input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirmer le mot de passe</Label>
                                    <Input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                    />
                                </div>
                                <Button onClick={handlePasswordChange} disabled={passwordLoading || !password}>
                                    {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
                                </Button>
                            </CardContent>
                        </Card>
                        
                        <Card className="border-red-200 dark:border-red-900">
                            <CardHeader>
                                <CardTitle className="text-red-600">Zone de danger</CardTitle>
                                <CardDescription>Actions irréversibles</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                    Supprimer mon compte
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* BILLING TAB */}
                    <TabsContent value="billing" className="space-y-6">
                         <Card>
                            <CardHeader>
                                <CardTitle>Votre Abonnement</CardTitle>
                                <CardDescription>Gérez votre plan et facturation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="font-medium">Plan Actuel</p>
                                        <p className="text-2xl font-bold text-primary">{planLabel}</p>
                                    </div>
                                    {subscriptionStatus === "active" ? (
                                        <Button onClick={handleManageBilling} disabled={billingLoading} variant="outline">
                                            {billingLoading ? "Chargement..." : "Gérer"}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleUpgrade} disabled={billingLoading}>
                                            {billingLoading ? "Chargement..." : "Passer Pro"}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* NOTIFICATIONS TAB */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Préférences Email</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Nouvelles offres matching</Label>
                                        <p className="text-sm text-slate-500">Alertes quand une offre correspond</p>
                                    </div>
                                    <Switch checked={prefs.emailNewMatch} onCheckedChange={(c) => setPrefs({...prefs, emailNewMatch: c})} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Rappels candidatures</Label>
                                        <p className="text-sm text-slate-500">Rappels de suivi</p>
                                    </div>
                                    <Switch checked={prefs.emailReminder} onCheckedChange={(c) => setPrefs({...prefs, emailReminder: c})} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
