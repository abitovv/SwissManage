import { Link } from "react-router-dom";
import React from "react";

export const HomePage = () => {
  return (
    <div className="container">
      <header className="header">
        <h1>🏆 Турнирная система 🏆</h1>
        <p className="subtitle">Организация соревнований по швейцарской системе</p>
      </header>
      
      <nav>
        <ul>
          <li><Link to="/setup" className="nav-link">Создать турнир</Link></li>
          <li><Link to="/tournament" className="nav-link"> Текущий турнир</Link></li>
          <li><Link to="/results" className="nav-link"> Итоги</Link></li>
          <li><Link to="/history" className="nav-link"> История турниров</Link></li>
        </ul>
      </nav>
      
      <div className="tournament-status">
        <h3>Инструкция по работе с турнирной системой</h3>
        <ol style={{ textAlign: 'left', marginTop: '1.5rem', paddingLeft: '1.5rem' }}>
          <li>Создайте турнир, указав параметры: название, систему проведения и контроль времени.</li>
          <li> Добавьте участников с их рейтингами для корректного распределения пар.</li>
          <li> Система генерирует пары перед каждым туром.</li>
          <li>Вносите результаты после каждого тура для обновления таблицы.</li>
          <li> Отслеживайте текущие результаты в режиме реального времени.</li>
          <li> Просматривайте историю завершенных турниров</li>
        </ol>
      </div>
    </div>
  );
};