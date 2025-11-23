"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { transactionService, categoryService, authService } from "@/lib/localStorageService";
import { TransactionCategorizeNotification } from "./TransactionCategorizeNotification";

export function NotificationSimulator({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
    const [showCategorizeDialog, setShowCategorizeDialog] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState<{ amount: number; receiver: string } | null>(null);

    const simulateTransaction = () => {
        // Specific transactions that can be randomly selected
        const specificTransactions = [
            { description: '₹4331 for Netflix', amount: 4331, receiver: 'Netflix', category: 'Entertainment', isBusiness: true },
            { description: '₹2389 for Ravi Contractor', amount: 2389, receiver: 'Ravi Contractor', category: 'Bills & Utilities', isBusiness: false },
            { description: '₹4301 paid at Amazon via Google Pay', amount: 4301, receiver: 'Amazon', category: 'Shopping', isBusiness: true },
            { description: '₹4406 received from Netmeds', amount: 4406, receiver: 'Netmeds', category: 'Healthcare', isBusiness: true },
            { description: '₹3683 paid using UPI to Myntra', amount: 3683, receiver: 'Myntra', category: 'Shopping', isBusiness: true },
            { description: '₹3980 received from Dominos', amount: 3980, receiver: 'Dominos', category: 'Food & Dining', isBusiness: true },
            { description: '₹2768 paid using UPI to Big Bazaar', amount: 2768, receiver: 'Big Bazaar', category: 'Groceries', isBusiness: true },
            { description: '₹2518 paid using UPI to HP Petrol Pump', amount: 2518, receiver: 'HP Petrol Pump', category: 'Transportation', isBusiness: true },
            { description: '₹4789 debited for purchase at Harsh', amount: 4789, receiver: 'Harsh', category: 'Shopping', isBusiness: false },
            { description: '₹1319 charged at Rapido', amount: 1319, receiver: 'Rapido', category: 'Transportation', isBusiness: true },
        ];

        // 30% chance to use specific transaction, 70% chance for random
        const useSpecific = Math.random() < 0.3;
        
        let amount: number;
        let receiver: string;
        let category: string;
        let isBusiness: boolean;

        if (useSpecific && specificTransactions.length > 0) {
            // Randomly pick a specific transaction
            const selected = specificTransactions[Math.floor(Math.random() * specificTransactions.length)];
            amount = selected.amount;
            receiver = selected.receiver;
            category = selected.category;
            isBusiness = selected.isBusiness;
        } else {
            // Generate random transaction
            isBusiness = Math.random() > 0.5;
            amount = Math.floor(Math.random() * 5000) + 100;
            receiver = isBusiness ? "Amazon India" : "Ramesh Kumar";
            category = isBusiness ? "Shopping" : "Personal";
        }

        // Simulate receiving a transaction
        // In a real app, this would come from a background service reading SMS

        if (isBusiness) {
            toast.success(`Transaction Categorized Successfully`, {
                description: `Paid ₹${amount} to ${receiver}. Category: ${category}`,
                action: {
                    label: "View",
                    onClick: () => console.log("View transaction"),
                },
            });
            // Auto-save to backend simulation
            saveTransaction(amount, receiver, category);
        } else {
            // Show dialog for personal transactions
            setPendingTransaction({ amount, receiver });
            setShowCategorizeDialog(true);
        }
    };

    const saveTransaction = (amount: number, receiver: string, category: string) => {
        try {
            const session = authService.getSession();
            const userId = session?.phone.replace(/\+/g, '');
            
            // Check if category exists, if not add it
            const categories = categoryService.getNames(userId);
            if (!categories.find(c => c.toLowerCase() === category.toLowerCase())) {
                categoryService.add(category, userId);
            }

            // Create transaction
            const transaction = {
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                description: `Payment to ${receiver}`,
                amount,
                category,
                date: new Date().toISOString(),
                recipient: receiver,
                type: 'debit' as const,
            };

            transactionService.save(transaction, userId);
            toast.success(`Transaction saved: ₹${amount} to ${receiver} (${category})`);
            // Force refresh
            if (onTransactionAdded) {
                setTimeout(() => {
                    onTransactionAdded();
                }, 100);
            }
        } catch (e) {
            console.error("Failed to save transaction", e);
            toast.error("Failed to save transaction");
        }
    };

    const handleCategorized = (category: string) => {
        if (pendingTransaction) {
            saveTransaction(pendingTransaction.amount, pendingTransaction.receiver, category);
            setPendingTransaction(null);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={simulateTransaction}>
                <Bell className="mr-2 h-4 w-4" /> Simulate Transaction
            </Button>
            {pendingTransaction && (
                <TransactionCategorizeNotification
                    open={showCategorizeDialog}
                    amount={pendingTransaction.amount}
                    receiver={pendingTransaction.receiver}
                    onCategorized={handleCategorized}
                    onDismiss={() => {
                        setShowCategorizeDialog(false);
                        setPendingTransaction(null);
                    }}
                />
            )}
        </>
    );
}
