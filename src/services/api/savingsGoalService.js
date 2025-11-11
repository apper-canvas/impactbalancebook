import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const tableName = 'savings_goals_c';

export const savingsGoalService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const response = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "priority_c"}}
        ],
        orderBy: [{"fieldName": "priority_c", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error("Error fetching savings goals:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(goal => ({
        Id: goal.Id,
        name: goal.name_c || goal.Name,
        targetAmount: goal.target_amount_c,
        currentAmount: goal.current_amount_c || 0,
        deadline: goal.deadline_c,
        priority: goal.priority_c
      })).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const response = await apperClient.getRecordById(tableName, parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "priority_c"}}
        ]
      });

      if (!response.success) {
        console.error("Error fetching savings goal:", response.message);
        return null;
      }

      const goal = response.data;
      return {
        Id: goal.Id,
        name: goal.name_c || goal.Name,
        targetAmount: goal.target_amount_c,
        currentAmount: goal.current_amount_c || 0,
        deadline: goal.deadline_c,
        priority: goal.priority_c
      };
    } catch (error) {
      console.error("Error fetching savings goal:", error?.response?.data?.message || error);
      return null;
    }
  },

  async create(goalData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.createRecord(tableName, {
        records: [{
          Name: goalData.name,
          name_c: goalData.name,
          target_amount_c: parseFloat(goalData.targetAmount),
          current_amount_c: 0,
          deadline_c: goalData.deadline,
          priority_c: goalData.priority
        }]
      });

      if (!response.success) {
        console.error("Error creating savings goal:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create savings goal: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create savings goal");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const goal = successful[0].data;
          return {
            Id: goal.Id,
            name: goal.name_c || goal.Name,
            targetAmount: goal.target_amount_c,
            currentAmount: goal.current_amount_c || 0,
            deadline: goal.deadline_c,
            priority: goal.priority_c
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error creating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, goalData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const updateData = { Id: parseInt(id) };

      if (goalData.name !== undefined) {
        updateData.Name = goalData.name;
        updateData.name_c = goalData.name;
      }
      if (goalData.targetAmount !== undefined) updateData.target_amount_c = parseFloat(goalData.targetAmount);
      if (goalData.currentAmount !== undefined) updateData.current_amount_c = parseFloat(goalData.currentAmount);
      if (goalData.deadline !== undefined) updateData.deadline_c = goalData.deadline;
      if (goalData.priority !== undefined) updateData.priority_c = goalData.priority;

      const response = await apperClient.updateRecord(tableName, {
        records: [updateData]
      });

      if (!response.success) {
        console.error("Error updating savings goal:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update savings goal: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update savings goal");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const goal = successful[0].data;
          return {
            Id: goal.Id,
            name: goal.name_c || goal.Name,
            targetAmount: goal.target_amount_c,
            currentAmount: goal.current_amount_c || 0,
            deadline: goal.deadline_c,
            priority: goal.priority_c
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error updating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async addContribution(id, amount) {
    try {
      // Get current goal first
      const currentGoal = await this.getById(id);
      if (!currentGoal) {
        throw new Error("Savings goal not found");
      }

      const newCurrentAmount = currentGoal.currentAmount + amount;

      // Update with new amount
      return await this.update(id, {
        currentAmount: newCurrentAmount
      });
    } catch (error) {
      console.error("Error adding contribution:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord(tableName, {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error("Error deleting savings goal:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getGoalsSummary() {
    try {
      const goals = await this.getAll();

      const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalRemaining = totalTargetAmount - totalCurrentAmount;
      const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

      const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
      const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);

      return {
        totalTargetAmount,
        totalCurrentAmount,
        totalRemaining,
        overallProgress,
        activeGoalsCount: activeGoals.length,
        completedGoalsCount: completedGoals.length,
        totalGoalsCount: goals.length
      };
    } catch (error) {
      console.error("Error fetching goals summary:", error?.response?.data?.message || error);
      return {
        totalTargetAmount: 0,
        totalCurrentAmount: 0,
        totalRemaining: 0,
        overallProgress: 0,
        activeGoalsCount: 0,
        completedGoalsCount: 0,
        totalGoalsCount: 0
      };
    }
  }
};