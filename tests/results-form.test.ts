import { test, expect } from '@playwright/test';

test.describe('ResultsForm Component', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу с явным URL
    await page.goto('http://localhost:5173/setup');

    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText('Настройка турнира');

    await page.fill('input[type="text"]', 'Тестовый турнир');
    await page.fill('input[type="number"] >> nth=0', '4');
    await page.fill('input[type="number"] >> nth=1', '3');
    await page.click('button:has-text("Создать турнир")');

    const players = [
      { firstName: 'Иван', lastName: 'Иванов', rating: 1800 },
      { firstName: 'Петр', lastName: 'Петров', rating: 1700 },
      { firstName: 'Анна', lastName: 'Сидорова', rating: 1600 },
      { firstName: 'Мария', lastName: 'Козлова', rating: 1500 },
    ];

    const playerCards = page.locator('.player-card');
    for (let i = 0; i < players.length; i++) {
      const card = playerCards.nth(i);
      await card.locator('input[type="text"] >> nth=0').fill(players[i].firstName);
      await card.locator('input[type="text"] >> nth=1').fill(players[i].lastName);
      await card.locator('input[type="number"]').fill(players[i].rating.toString());
    }

    await page.click('button:has-text("Сохранить участников")');
    await page.click('button:has-text("Начать турнир")');
  });

  test('Отображение и отправка результатов первого тура', async ({ page }) => {
    // Проверяем заголовок формы результатов
    await expect(page.locator('h2:has-text("Результаты")')).toContainText('Результаты 1 тура');

    const pairings = page.locator('.pairing-result');
    await expect(pairings).toHaveCount(2);

    const firstPairing = pairings.nth(0);
    await expect(firstPairing.locator('.player-name.player1')).toContainText('Иван Иванов');
    await expect(firstPairing.locator('.player-name.player2')).toContainText('Анна Сидорова');

    for (let i = 0; i < 2; i++) {
      const pairing = pairings.nth(i);
      // Выбираем первую радиокнопку (предположительно первый игрок)
      await pairing.locator('input[type="radio"]').nth(0).check();
    }

    await page.click('button:has-text("Сохранить результаты")');
    await expect(page.locator('h2:has-text("Пары")')).toContainText('Пары 2 тура');
  });

  test('Валидация при отсутствии результатов', async ({ page }) => {
    await page.click('button:has-text("Сохранить результаты")');

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Пожалуйста, укажите результаты для всех пар');
      await dialog.accept();
    });

    await expect(page.locator('h2:has-text("Результаты")')).toContainText('Результаты 1 тура');
  });
});