import connectToDatabase from "../connect";
import { ContextGroup } from "../models";

class ContextGroupRepository {
  /**
   * Find all context groups
   * @returns {Promise<Array>} Array of context groups
   */
  async findAll() {
    await connectToDatabase();
    return ContextGroup.find().sort({ updatedAt: -1 });
  }

  /**
   * Find a context group by ID
   * @param {string} id - The context group ID
   * @returns {Promise<Object>} The context group object
   */
  async findById(id) {
    if (!id) return null;
    await connectToDatabase();
    return ContextGroup.findById(id);
  }

  /**
   * Create a new context group
   * @param {Object} data - The context group data
   * @returns {Promise<Object>} The created context group
   */
  async create(data) {
    await connectToDatabase();
    const contextGroup = new ContextGroup({
      name: data.name,
      description: data.description || "",
      items: data.items || [],
      metadata: data.metadata || {},
    });
    return contextGroup.save();
  }

  /**
   * Update a context group
   * @param {string} id - The context group ID
   * @param {Object} data - The updated context group data
   * @returns {Promise<Object>} The updated context group
   */
  async update(id, data) {
    await connectToDatabase();
    const contextGroup = await ContextGroup.findById(id);

    if (!contextGroup) {
      throw new Error(`Context group with ID ${id} not found`);
    }

    if (data.name !== undefined) contextGroup.name = data.name;
    if (data.description !== undefined) contextGroup.description = data.description;
    if (data.metadata !== undefined) contextGroup.metadata = { ...contextGroup.metadata, ...data.metadata };

    // Only update items if explicitly provided
    if (data.items !== undefined) contextGroup.items = data.items;

    return contextGroup.save();
  }

  /**
   * Delete a context group
   * @param {string} id - The context group ID
   * @returns {Promise<Object>} The deletion result
   */
  async delete(id) {
    await connectToDatabase();
    return ContextGroup.findByIdAndDelete(id);
  }

  /**
   * Add an item to a context group
   * @param {string} groupId - The context group ID
   * @param {Object} item - The item to add ({type, id})
   * @returns {Promise<Object>} The updated context group
   */
  async addItem(groupId, item) {
    await connectToDatabase();
    const contextGroup = await ContextGroup.findById(groupId);

    if (!contextGroup) {
      throw new Error(`Context group with ID ${groupId} not found`);
    }

    // Check if the item already exists in the group
    const itemExists = contextGroup.items.some(
      (existing) => existing.type === item.type && existing.id.toString() === item.id.toString()
    );

    if (itemExists) {
      throw new Error("Item already exists in this context group");
    }

    // Add the item to the group
    contextGroup.items.push({
      type: item.type,
      id: item.id,
      addedAt: new Date(),
    });

    return contextGroup.save();
  }

  /**
   * Remove an item from a context group
   * @param {string} groupId - The context group ID
   * @param {string} itemId - The item ID to remove
   * @returns {Promise<Object>} The updated context group
   */
  async removeItem(groupId, itemId) {
    await connectToDatabase();
    const contextGroup = await ContextGroup.findById(groupId);

    if (!contextGroup) {
      throw new Error(`Context group with ID ${groupId} not found`);
    }

    // Remove the item from the group
    contextGroup.items = contextGroup.items.filter((item) => item._id.toString() !== itemId);

    return contextGroup.save();
  }

  /**
   * Update the lastUsedAt field of a context group
   * @param {string} id - The context group ID
   * @returns {Promise<Object>} The updated context group
   */
  async markAsUsed(id) {
    await connectToDatabase();
    const contextGroup = await ContextGroup.findById(id);

    if (!contextGroup) {
      throw new Error(`Context group with ID ${id} not found`);
    }

    contextGroup.lastUsedAt = new Date();
    return contextGroup.save();
  }

  /**
   * Get all items in a context group with their details
   * @param {string} id - The context group ID
   * @returns {Promise<Array>} Array of items with their details
   */
  async getItemsWithDetails(id) {
    await connectToDatabase();
    const contextGroup = await ContextGroup.findById(id);

    if (!contextGroup) {
      throw new Error(`Context group with ID ${id} not found`);
    }

    return contextGroup.getItemsWithDetails();
  }
}

export default new ContextGroupRepository();
