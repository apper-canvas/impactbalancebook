import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const tableName = 'budgets_c';

export const budgetService = {
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "month_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error("Error fetching budgets:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(budget => ({
        Id: budget.Id,
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0,
        category: budget.category_c?.Name || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ]
      });

      if (!response.success) {
        console.error("Error fetching budget:", response.message);
        return null;
      }

      const budget = response.data;
      return {
        Id: budget.Id,
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0,
        category: budget.category_c?.Name || "Uncategorized"
      };
    } catch (error) {
      console.error("Error fetching budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async getByMonth(month) {
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
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}},
          {"field": {"Name": "rollover_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [{
          "FieldName": "month_c",
          "Operator": "StartsWith",
          "Values": [month],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Error fetching budgets by month:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(budget => ({
        Id: budget.Id,
        month: budget.month_c,
        monthlyLimit: budget.monthly_limit_c,
        spent: budget.spent_c || 0,
        rollover: budget.rollover_c || 0,
        category: budget.category_c?.Name || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      // Get category ID by name
      let categoryId = null;
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "Id"}}],
          where: [{
            "FieldName": "name_c",
            "Operator": "EqualTo",
            "Values": [budgetData.category],
            "Include": true
          }]
        });

        if (categoryResponse.success && categoryResponse.data.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.createRecord(tableName, {
        records: [{
          Name: `${budgetData.category} - ${budgetData.month}`,
          month_c: budgetData.month,
          monthly_limit_c: parseFloat(budgetData.monthlyLimit),
          spent_c: 0,
          rollover_c: 0,
          category_c: categoryId
        }]
      });

      if (!response.success) {
        console.error("Error creating budget:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create budget: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create budget");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const budget = successful[0].data;
          return {
            Id: budget.Id,
            month: budget.month_c,
            monthlyLimit: budget.monthly_limit_c,
            spent: budget.spent_c || 0,
            rollover: budget.rollover_c || 0,
            category: budget.category_c?.Name || "Uncategorized"
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const updateData = { Id: parseInt(id) };

      // Get category ID by name if category is being updated
      if (budgetData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "Id"}}],
          where: [{
            "FieldName": "name_c",
            "Operator": "EqualTo",
            "Values": [budgetData.category],
            "Include": true
          }]
        });

        if (categoryResponse.success && categoryResponse.data.length > 0) {
          updateData.category_c = categoryResponse.data[0].Id;
        }
      }

      // Map other fields
      if (budgetData.month !== undefined) updateData.month_c = budgetData.month;
      if (budgetData.monthlyLimit !== undefined) updateData.monthly_limit_c = parseFloat(budgetData.monthlyLimit);
      if (budgetData.spent !== undefined) updateData.spent_c = parseFloat(budgetData.spent);
      if (budgetData.rollover !== undefined) updateData.rollover_c = parseFloat(budgetData.rollover);

      const response = await apperClient.updateRecord(tableName, {
        records: [updateData]
      });

      if (!response.success) {
        console.error("Error updating budget:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update budget: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update budget");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const budget = successful[0].data;
          return {
            Id: budget.Id,
            month: budget.month_c,
            monthlyLimit: budget.monthly_limit_c,
            spent: budget.spent_c || 0,
            rollover: budget.rollover_c || 0,
            category: budget.category_c?.Name || "Uncategorized"
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateSpent(category, month, amount) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      // Get category ID by name
      const categoryResponse = await apperClient.fetchRecords('categories_c', {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "name_c",
          "Operator": "EqualTo",
          "Values": [category],
          "Include": true
        }]
      });

      if (!categoryResponse.success || !categoryResponse.data.length) {
        return null;
      }

      const categoryId = categoryResponse.data[0].Id;

      // Find budget by category and month
      const budgetResponse = await apperClient.fetchRecords(tableName, {
        fields: [{"field": {"Name": "Id"}}],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [categoryId],
          "Include": true
        }, {
          "FieldName": "month_c",
          "Operator": "StartsWith",
          "Values": [month],
          "Include": true
        }]
      });

      if (!budgetResponse.success || !budgetResponse.data.length) {
        return null;
      }

      const budgetId = budgetResponse.data[0].Id;

      // Update spent amount
      const updateResponse = await apperClient.updateRecord(tableName, {
        records: [{
          Id: budgetId,
          spent_c: parseFloat(amount)
        }]
      });

      if (!updateResponse.success) {
        console.error("Error updating budget spent:", updateResponse.message);
        return null;
      }

      if (updateResponse.results && updateResponse.results.length > 0) {
        const successful = updateResponse.results.filter(r => r.success);
        if (successful.length > 0) {
          const budget = successful[0].data;
          return {
            Id: budget.Id,
            month: budget.month_c,
            monthlyLimit: budget.monthly_limit_c,
            spent: budget.spent_c || 0,
            rollover: budget.rollover_c || 0,
            category: budget.category_c?.Name || "Uncategorized"
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating budget spent:", error?.response?.data?.message || error);
      return null;
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
        console.error("Error deleting budget:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getBudgetSummary(month) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return {
          totalBudget: 0,
          totalSpent: 0,
          remaining: 0,
          percentage: 0,
          categories: 0
        };
      }

      const response = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "spent_c"}}
        ],
        where: [{
          "FieldName": "month_c",
          "Operator": "StartsWith",
          "Values": [month],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Error fetching budget summary:", response.message);
        return {
          totalBudget: 0,
          totalSpent: 0,
          remaining: 0,
          percentage: 0,
          categories: 0
        };
      }

      const monthBudgets = response.data;
      const totalBudget = monthBudgets.reduce((sum, b) => sum + (b.monthly_limit_c || 0), 0);
      const totalSpent = monthBudgets.reduce((sum, b) => sum + (b.spent_c || 0), 0);
      const remaining = totalBudget - totalSpent;
      const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      return {
        totalBudget,
        totalSpent,
        remaining,
        percentage,
        categories: monthBudgets.length
      };
    } catch (error) {
      console.error("Error fetching budget summary:", error?.response?.data?.message || error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        percentage: 0,
        categories: 0
      };
    }
  }
};