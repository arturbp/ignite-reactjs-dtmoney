import { createContext, useEffect, useState, ReactNode, useContext } from 'react';
import { api } from '../services/api';

interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'deposit' | 'withdraw',
  category: string;
  createdAt: string;
}

type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>

interface TransactionProviderProps {
  children: ReactNode;
}

interface TransactionContextData {
  transactions: Transaction[];
  createTransaction: (transaction: TransactionInput) => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextData>(
  {} as TransactionContextData
);

export function TransactionsProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    api.get('transactions')
      .then(resp => setTransactions(resp.data.transactions))
  }, [])

  async function createTransaction(transactionInput: TransactionInput) {
    const { data: { transaction } } = await api.post('transactions', {
      ...transactionInput,
      createdAt: new Date()
    })

    setTransactions([
      ...transactions,
      transaction
    ])
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        createTransaction
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  return context;
}