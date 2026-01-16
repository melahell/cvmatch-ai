"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Weight = 'important' | 'inclus' | 'exclu';

interface WeightSelectorProps {
    value: Weight;
    onChange: (weight: Weight) => void;
    disabled?: boolean;
}

export function WeightSelector({ value, onChange, disabled = false }: WeightSelectorProps) {
    const options = [
        {
            value: 'important' as Weight,
            label: '⭐ Important',
            description: 'Mis en avant',
            className: 'text-green-600'
        },
        {
            value: 'inclus' as Weight,
            label: '✓ Inclus',
            description: 'Présent normalement',
            className: 'text-blue-600'
        },
        {
            value: 'exclu' as Weight,
            label: '✗ Exclu',
            description: 'Masqué du profil',
            className: 'text-red-600'
        },
    ];

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-[140px]">
                <SelectValue>
                    <span className={selectedOption?.className}>
                        {selectedOption?.label}
                    </span>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className={opt.className}>
                        <div className="flex flex-col">
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-xs text-slate-500">{opt.description}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
