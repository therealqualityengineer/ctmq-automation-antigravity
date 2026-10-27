import { test, expect } from '../fixtures/customFixtures';

test.describe('TodoMVC Feature Suite', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.gotoTodoApp();
  });

  test('TC01 - Successfully add a new todo item and verify counter', async ({ todoPage }) => {
    await todoPage.addTodo('Learn Antigravity Agent Framework');
    await expect(todoPage.todoItems).toHaveCount(1);
    await expect(todoPage.todoItems.first()).toHaveText('Learn Antigravity Agent Framework');
    const countText = await todoPage.getTodoCountText();
    expect(countText).toContain('1 item left');
  });
});
