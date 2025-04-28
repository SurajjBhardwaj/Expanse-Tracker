"use client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExpensesTab from "@/components/dashboard/ExpensesTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      <motion.main
        className="flex-1 py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's an overview of your expenses
            </p>
          </div>

          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="expenses" className="mt-0">
              <ExpensesTab />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <AnalyticsTab />
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </div>
  );
}
