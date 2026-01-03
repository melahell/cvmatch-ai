"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Contact {
    id: string;
    name: string;
    role?: string;
    company?: string;
    email?: string;
    phone?: string;
    notes?: string;
}

interface NetworkContactsProps {
    jobId: string;
    contacts: Contact[];
    onAddContact?: (contact: Omit<Contact, 'id'>) => void;
    onRemoveContact?: (contactId: string) => void;
}

export function NetworkContacts({ jobId, contacts, onAddContact, onRemoveContact }: NetworkContactsProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', role: '', email: '' });

    const handleAdd = () => {
        if (newContact.name && onAddContact) {
            onAddContact(newContact);
            setNewContact({ name: '', role: '', email: '' });
            setIsAdding(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Contacts Réseau</CardTitle>
                    <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {isAdding && (
                    <div className="p-3 border rounded-lg space-y-2 bg-slate-50">
                        <Input
                            placeholder="Nom"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                        />
                        <Input
                            placeholder="Rôle"
                            value={newContact.role}
                            onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                        />
                        <Input
                            placeholder="Email"
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleAdd}>Ajouter</Button>
                            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Annuler</Button>
                        </div>
                    </div>
                )}

                {contacts.map((contact) => (
                    <div key={contact.id} className="p-3 border rounded-lg flex justify-between items-start">
                        <div>
                            <div className="font-medium">{contact.name}</div>
                            {contact.role && <div className="text-sm text-slate-600">{contact.role}</div>}
                            {contact.email && <div className="text-xs text-slate-500">{contact.email}</div>}
                        </div>
                        {onRemoveContact && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveContact(contact.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                ))}

                {contacts.length === 0 && !isAdding && (
                    <div className="text-center text-sm text-slate-400 py-4">
                        Aucun contact enregistré
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
