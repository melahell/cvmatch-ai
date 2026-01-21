"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type AdminUser = {
    id: string;
    email: string;
    user_id: string;
    role: string;
    subscription_tier: string;
    subscription_status: string;
    created_at: string;
};

export default function AdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("user");
    const [saving, setSaving] = useState(false);

    const sortedUsers = useMemo(() => users, [users]);

    useEffect(() => {
        const run = async () => {
            try {
                const me = await fetch("/api/admin/me");
                if (!me.ok) {
                    router.replace("/dashboard");
                    return;
                }
                const meData = await me.json();
                if (!meData.isAdmin) {
                    router.replace("/dashboard");
                    return;
                }

                const res = await fetch("/api/admin/users");
                if (!res.ok) {
                    toast.error("Impossible de charger les utilisateurs");
                    return;
                }
                const data = await res.json();
                setUsers(data.users || []);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [router]);

    const refreshUsers = async () => {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
            const data = await res.json();
            setUsers(data.users || []);
        }
    };

    const handleCreateUser = async () => {
        if (!email || !fullName) {
            toast.error("Email et nom requis");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, fullName, role })
            });
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Erreur création utilisateur");
                return;
            }
            toast.success("Utilisateur créé");
            setEmail("");
            setFullName("");
            setRole("user");
            await refreshUsers();
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUser = async (userId: string, update: Partial<AdminUser>) => {
        const res = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update)
        });
        if (!res.ok) {
            const data = await res.json();
            toast.error(data.error || "Erreur mise à jour");
            return;
        }
        toast.success("Utilisateur mis à jour");
        await refreshUsers();
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto py-6 px-4">Chargement...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 px-4 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Backoffice Admin</h1>
                    <p className="text-slate-600 dark:text-slate-600">Gestion comptes et abonnements</p>
                </div>

                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Créer un compte</CardTitle>
                        <CardDescription>Invitation directe avec création Supabase</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Input placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Utilisateur</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleCreateUser} disabled={saving}>
                            {saving ? "Création..." : "Créer"}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="dark:bg-slate-900 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Utilisateurs</CardTitle>
                        <CardDescription>{sortedUsers.length} comptes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            {sortedUsers.map((user) => (
                                <div key={user.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 grid md:grid-cols-5 gap-3 items-center">
                                    <div>
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</div>
                                        <div className="text-xs text-slate-500">{user.user_id}</div>
                                    </div>
                                    <Select value={user.role || "user"} onValueChange={(value) => handleUpdateUser(user.id, { role: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">Utilisateur</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={user.subscription_tier || "free"} onValueChange={(value) => handleUpdateUser(user.id, { subscription_tier: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="team">Team</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={user.subscription_status || "inactive"} onValueChange={(value) => handleUpdateUser(user.id, { subscription_status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="canceled">Canceled</SelectItem>
                                            <SelectItem value="past_due">Past due</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
