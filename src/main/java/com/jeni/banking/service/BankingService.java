package com.jeni.banking.service;

import com.jeni.banking.model.Account;
import com.jeni.banking.model.Transaction;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BankingService {
    private final ConcurrentHashMap<String, Account> accounts = new ConcurrentHashMap<>();
    private final List<Transaction> transactions = new ArrayList<>();

    public BankingService() {
        accounts.put("ACC1001", new Account("ACC1001", "Demo Customer", 10000.00));
        accounts.put("ACC1002", new Account("ACC1002", "Test Customer", 5000.00));
    }

    public List<Account> getAccounts() {
        return new ArrayList<>(accounts.values());
    }

    public Account createAccount(String customerName, double openingBalance) {
        String id = "ACC" + (1000 + accounts.size() + 1);
        Account account = new Account(id, customerName, openingBalance);
        accounts.put(id, account);
        return account;
    }

    public synchronized Transaction transfer(String from, String to, double amount) {
        Account sender = accounts.get(from);
        Account receiver = accounts.get(to);

        if (sender == null || receiver == null) {
            return new Transaction(UUID.randomUUID().toString(), from, to, amount,
                    "FAILED_ACCOUNT_NOT_FOUND", Instant.now());
        }
        if (amount <= 0) {
            return new Transaction(UUID.randomUUID().toString(), from, to, amount,
                    "FAILED_INVALID_AMOUNT", Instant.now());
        }
        if (sender.balance() < amount) {
            return new Transaction(UUID.randomUUID().toString(), from, to, amount,
                    "FAILED_INSUFFICIENT_FUNDS", Instant.now());
        }

        accounts.put(from, new Account(sender.id(), sender.customerName(), sender.balance() - amount));
        accounts.put(to, new Account(receiver.id(), receiver.customerName(), receiver.balance() + amount));

        Transaction tx = new Transaction(UUID.randomUUID().toString(), from, to, amount,
                "SUCCESS", Instant.now());
        transactions.add(tx);
        return tx;
    }

    public List<Transaction> getTransactions() {
        return List.copyOf(transactions);
    }
}
