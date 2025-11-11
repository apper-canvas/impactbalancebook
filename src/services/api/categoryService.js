import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

const tableName = 'categories_c';

export const categoryService = {
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
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      });

      if (!response.success) {
        console.error("Error fetching categories:", response.message);
        toast.error(response.message);
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || "#6b7280",
        icon: category.icon_c || "Tag",
        isCustom: category.is_custom_c || false
      }));
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
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
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ]
      });

      if (!response.success) {
        console.error("Error fetching category:", response.message);
        return null;
      }

      const category = response.data;
      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || "#6b7280", 
        icon: category.icon_c || "Tag",
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error("Error fetching category:", error?.response?.data?.message || error);
      return null;
    }
  },

  async getByName(name) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        return null;
      }

      const response = await apperClient.fetchRecords(tableName, {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "icon_c"}},
          {"field": {"Name": "is_custom_c"}}
        ],
        where: [{
          "FieldName": "name_c",
          "Operator": "EqualTo",
          "Values": [name],
          "Include": true
        }]
      });

      if (!response.success) {
        console.error("Error fetching category by name:", response.message);
        return null;
      }

      if (response.data.length === 0) return null;

      const category = response.data[0];
      return {
        Id: category.Id,
        name: category.name_c || category.Name,
        color: category.color_c || "#6b7280",
        icon: category.icon_c || "Tag", 
        isCustom: category.is_custom_c || false
      };
    } catch (error) {
      console.error("Error fetching category by name:", error?.response?.data?.message || error);
      return null;
    }
  },

  async create(categoryData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.createRecord(tableName, {
        records: [{
          Name: categoryData.name,
          name_c: categoryData.name,
          color_c: categoryData.color || "#6b7280",
          icon_c: categoryData.icon || "Tag",
          is_custom_c: true
        }]
      });

      if (!response.success) {
        console.error("Error creating category:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create category: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to create category");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const category = successful[0].data;
          return {
            Id: category.Id,
            name: category.name_c || category.Name,
            color: category.color_c || "#6b7280",
            icon: category.icon_c || "Tag",
            isCustom: category.is_custom_c || false
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, categoryData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        console.error("ApperClient not initialized");
        throw new Error("ApperClient not initialized");
      }

      const updateData = {};
      if (categoryData.name !== undefined) {
        updateData.Name = categoryData.name;
        updateData.name_c = categoryData.name;
      }
      if (categoryData.color !== undefined) updateData.color_c = categoryData.color;
      if (categoryData.icon !== undefined) updateData.icon_c = categoryData.icon;
      if (categoryData.isCustom !== undefined) updateData.is_custom_c = categoryData.isCustom;

      const response = await apperClient.updateRecord(tableName, {
        records: [{
          Id: parseInt(id),
          ...updateData
        }]
      });

      if (!response.success) {
        console.error("Error updating category:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update category: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to update category");
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          const category = successful[0].data;
          return {
            Id: category.Id,
            name: category.name_c || category.Name,
            color: category.color_c || "#6b7280",
            icon: category.icon_c || "Tag",
            isCustom: category.is_custom_c || false
          };
        }
      }

      throw new Error("No successful results returned");
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
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
        console.error("Error deleting category:", response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete category: ${failed.map(f => f.message).join(', ')}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error("Failed to delete category");
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      throw error;
}
  }
};