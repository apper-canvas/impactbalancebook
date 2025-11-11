import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const tableName = 'transactions_c';

export const transactionService = {
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
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "category_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error("Error fetching transactions:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(transaction => ({
        Id: transaction.Id,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || transaction.Name,
        notes: transaction.notes_c || "",
        type: transaction.type_c,
        category: transaction.category_c?.Name || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
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
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "category_c"}}
        ]
      });

      if (!response.success) {
        console.error("Error fetching transaction:", response.message);
        return null;
      }

      const transaction = response.data;
      return {
        Id: transaction.Id,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || transaction.Name,
        notes: transaction.notes_c || "",
        type: transaction.type_c,
        category: transaction.category_c?.Name || "Uncategorized"
      };
    } catch (error) {
      console.error("Error fetching transaction:", error?.response?.data?.message || error);
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
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [{
          "FieldName": "date_c",
          "Operator": "StartsWith",
          "Values": [month],
          "Include": true
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      });

      if (!response.success) {
        console.error("Error fetching transactions by month:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data.map(transaction => ({
        Id: transaction.Id,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || transaction.Name,
        notes: transaction.notes_c || "",
        type: transaction.type_c,
        category: transaction.category_c?.Name || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching transactions by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getByCategory(category) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      // First get category ID by name
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
        return [];
      }

      const categoryId = categoryResponse.data[0].Id;

      const response = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [categoryId],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Error fetching transactions by category:", response.message);
        return [];
      }

      return response.data.map(transaction => ({
        Id: transaction.Id,
        amount: transaction.amount_c,
        date: transaction.date_c,
        description: transaction.description_c || transaction.Name,
        notes: transaction.notes_c || "",
        type: transaction.type_c,
        category: transaction.category_c?.Name || "Uncategorized"
      }));
    } catch (error) {
      console.error("Error fetching transactions by category:", error?.response?.data?.message || error);
      return [];
    }
  },

  async create(transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      // Get category ID by name
      let categoryId = null;
      if (transactionData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "Id"}}],
          where: [{
            "FieldName": "name_c",
            "Operator": "EqualTo",
            "Values": [transactionData.category],
            "Include": true
          }]
        });

        if (categoryResponse.success && categoryResponse.data.length > 0) {
          categoryId = categoryResponse.data[0].Id;
        }
      }

      const response = await apperClient.createRecord(tableName, {
        records: [{
          Name: transactionData.description,
          amount_c: parseFloat(transactionData.amount),
          date_c: transactionData.date,
          description_c: transactionData.description,
          notes_c: transactionData.notes || "",
          type_c: transactionData.type,
          category_c: categoryId
        }]
      });

      if (!response.success) {
        console.error("Error creating transaction:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create transaction: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create transaction");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const transaction = successful[0].data;
          return {
            Id: transaction.Id,
            amount: transaction.amount_c,
            date: transaction.date_c,
            description: transaction.description_c || transaction.Name,
            notes: transaction.notes_c || "",
            type: transaction.type_c,
            category: transaction.category_c?.Name || "Uncategorized"
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const updateData = { Id: parseInt(id) };

      // Get category ID by name if category is being updated
      if (transactionData.category) {
        const categoryResponse = await apperClient.fetchRecords('categories_c', {
          fields: [{"field": {"Name": "Id"}}],
          where: [{
            "FieldName": "name_c",
            "Operator": "EqualTo",
            "Values": [transactionData.category],
            "Include": true
          }]
        });

        if (categoryResponse.success && categoryResponse.data.length > 0) {
          updateData.category_c = categoryResponse.data[0].Id;
        }
      }

      // Map other fields
      if (transactionData.amount !== undefined) updateData.amount_c = parseFloat(transactionData.amount);
      if (transactionData.date !== undefined) updateData.date_c = transactionData.date;
      if (transactionData.description !== undefined) {
        updateData.Name = transactionData.description;
        updateData.description_c = transactionData.description;
      }
      if (transactionData.notes !== undefined) updateData.notes_c = transactionData.notes;
      if (transactionData.type !== undefined) updateData.type_c = transactionData.type;

      const response = await apperClient.updateRecord(tableName, {
        records: [updateData]
      });

      if (!response.success) {
        console.error("Error updating transaction:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update transaction: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update transaction");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const transaction = successful[0].data;
          return {
            Id: transaction.Id,
            amount: transaction.amount_c,
            date: transaction.date_c,
            description: transaction.description_c || transaction.Name,
            notes: transaction.notes_c || "",
            type: transaction.type_c,
            category: transaction.category_c?.Name || "Uncategorized"
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
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
        console.error("Error deleting transaction:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getIncomeExpenseTrend(months) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const trendData = [];

      for (const month of months) {
        const response = await apperClient.fetchRecords(tableName, {
          fields: [
            {"field": {"Name": "amount_c"}},
            {"field": {"Name": "type_c"}}
          ],
          where: [{
            "FieldName": "date_c",
            "Operator": "StartsWith",
            "Values": [month],
            "Include": true
          }]
        });

        if (response.success) {
          const transactions = response.data;
          const income = transactions
            .filter(t => t.type_c === "income")
            .reduce((sum, t) => sum + (t.amount_c || 0), 0);
          const expenses = transactions
            .filter(t => t.type_c === "expense")
            .reduce((sum, t) => sum + (t.amount_c || 0), 0);

          trendData.push({
            month,
            income,
            expenses,
            net: income - expenses
          });
        }
      }

      return trendData;
    } catch (error) {
      console.error("Error fetching income/expense trend:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getCategoryBreakdown(month) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return [];
      }

      const response = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}}
        ],
        where: [{
          "FieldName": "date_c",
          "Operator": "StartsWith",
          "Values": [month],
          "Include": true
        }, {
          "FieldName": "type_c",
          "Operator": "EqualTo",
          "Values": ["expense"],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Error fetching category breakdown:", response.message);
        return [];
      }

      const categoryTotals = response.data.reduce((acc, transaction) => {
        const categoryName = transaction.category_c?.Name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_c || 0);
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));
    } catch (error) {
      console.error("Error fetching category breakdown:", error?.response?.data?.message || error);
      return [];
    }
  }
};