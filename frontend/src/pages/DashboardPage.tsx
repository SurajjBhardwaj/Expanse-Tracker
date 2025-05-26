"use client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExpensesTab from "@/components/dashboard/ExpensesTab";
import AnalyticsTab from "@/components/dashboard/AnalyticsTab";
import TrashTab from "@/components/dashboard/TrashTab";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("expenses");

  useEffect(() => {
    // Set the initial active tab based on the URL or default to "expenses"
    console.log("DashboardPage mounted", activeTab);
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="flex h-screen min-w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

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

          <Tabs
            defaultValue="expenses"
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger
                value="expenses"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "expenses"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Expenses
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "analytics"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="trash"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === "trash"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                Trash
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expenses">
              <ExpensesTab />
            </TabsContent>
            <TabsContent value="analytics">
              <AnalyticsTab />
            </TabsContent>
            <TabsContent value="trash">
              <TrashTab />
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </div>
  );
}
