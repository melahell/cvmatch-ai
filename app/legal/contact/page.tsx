"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.message) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setSending(true);

        // Simulate sending (TODO: implement actual email API)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSending(false);
        setSent(true);
        toast.success("Message envoyé avec succès !");
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">
                            Message envoyé !
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Nous reviendrons vers vous dans les plus brefs délais.
                        </p>
                        <a
                            href="/dashboard"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            ← Retour au Dashboard
                        </a>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-2xl px-4 py-12">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Nous contacter
                    </h1>
                    <p className="text-slate-600">
                        Une question, un bug, une suggestion ? On vous écoute !
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Envoyez-nous un message
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nom *
                                    </label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Email *
                                    </label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="votre@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Sujet
                                </label>
                                <Input
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    placeholder="Ex: Question sur mon profil"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Message *
                                </label>
                                <Textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    placeholder="Décrivez votre demande..."
                                    rows={6}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={sending}
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Envoyer le message
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Alternative contact */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 mb-2">
                        Vous pouvez aussi nous contacter directement :
                    </p>
                    <a
                        href="mailto:contact@cvmatch.ai"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Mail className="w-4 h-4" />
                        contact@cvmatch.ai
                    </a>
                </div>

                <div className="mt-8 text-center">
                    <a
                        href="/dashboard"
                        className="text-slate-500 hover:text-slate-700"
                    >
                        ← Retour au Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
