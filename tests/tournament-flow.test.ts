import { test, expect } from '@playwright/test';

test.describe('Полный цикл турнира', () => {
  test('Создание, проведение и проверка результатов турнира', async ({ page }) => {
    // Переходим на страницу создания турнира с явным URL
    await page.goto('http://localhost:5173/setup');

    // Проверяем, что страница загрузилась
    await expect(page.locator('h1')).toContainText('Настройка турнира');

    // Шаг 1: Создание турнира
    await page.fill('input[type="text"]', 'Тестовый турнир');
    await page.fill('input[type="number"] >> nth=0', '4'); // 4 участника
    await page.fill('input[type="number"] >> nth=1', '3'); // 3 тура
    await page.click('button:has-text("Создать турнир")');

    // Шаг 2: Добавление участников
    const playerCards = page.locator('.player-card');
    await expect(playerCards).toHaveCount(4);

    const players = [
      { firstName: 'Иван', lastName: 'Иванов', rating: 1800 },
      { firstName: 'Петр', lastName: 'Петров', rating: 1700 },
      { firstName: 'Анна', lastName: 'Сидорова', rating: 1600 },
      { firstName: 'Мария', lastName: 'Козлова', rating: 1500 },
    ];

    for (let i = 0; i < players.length; i++) {
      const card = playerCards.nth(i);
      await card.locator('input[type="text"] >> nth=0').fill(players[i].firstName);
      await card.locator('input[type="text"] >> nth=1').fill(players[i].lastName);
      await card.locator('input[type="number"]').fill(players[i].rating.toString());
    }

    await page.click('button:has-text("Сохранить участников")');

    // Шаг 3: Начало турнира
    await expect(page.locator('h1')).toContainText('Тестовый турнир');
    await page.click('button:has-text("Начать турнир")');

    // Шаг 4: Проведение всех туров
    for (let round = 1; round <= 3; round++) {
      // Проверяем заголовок пар тура
      await expect(page.locator('h2:has-text("Пары")')).toContainText(`Пары ${round} тура`);

      // Ожидаем появления формы результатов
      await expect(page.locator('h2:has-text("Результаты")')).toContainText(`Результаты ${round} тура`);

      const pairings = page.locator('.pairing-result');
      const pairingCount = await pairings.count();

      for (let i = 0; i < pairingCount; i++) {
        const pairing = pairings.nth(i);
        if (!(await pairing.locator('.bye-text').isVisible())) {
          // Попробуем найти радиокнопку первого игрока
          await pairing.locator('input[type="radio"]').nth(0).check(); // Выбираем первую радиокнопку
        }
      }

      await page.click('button:has-text("Сохранить результаты")');

      if (round < 3) {
        await page.click('button:has-text("Сгенерировать пары")');
      }
    }

    // Шаг 5: Проверка результатов
    await expect(page.locator('h1')).toContainText('Результаты турнира: Тестовый турнир');
    const standingsTable = page.locator('.compact-table');
    await expect(standingsTable).toBeVisible();

    const rows = standingsTable.locator('tbody tr');
    await expect(rows).toHaveCount(4);

    const firstRow = rows.nth(0);
    await expect(firstRow.locator('td').nth(1)).toContainText('Иван Иванов');
    await expect(firstRow.locator('td').nth(3)).toContainText('3');

    // Шаг 6: Проверка истории
    await page.click('text=К истории турниров');
    await expect(page.locator('h1')).toContainText('История турниров');
    await expect(page.locator('.tournament-card')).toContainText('Тестовый турнир');
  });
});