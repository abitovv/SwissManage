import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Player } from "../tournament";
import React from "react";

interface StandingsTableProps {
  players: Player[];
}

export const StandingsTable = ({ players }: StandingsTableProps) => {
  const calculateBuchholz = (player: Player) => {
    return player.opponents.reduce((sum, id) => {
      const opponent = players.find(p => p.id === id);
      return sum + (opponent?.points || 0);
    }, 0);
  };

  const columns = [
    {
      header: "#",
      cell: (info: any) => info.row.index + 1,
      size: 40,
    },
    {
      header: "Участник",
      accessorFn: (row: Player) => `${row.firstName} ${row.lastName}`,
      size: 150,
    },
    {
      header: "Рейт.",
      accessorKey: "rating",
      size: 60,
    },
    {
      header: "Очки",
      accessorKey: "points",
      size: 60,
    },
    {
      header: "Бухгольц",
      cell: (info: any) => calculateBuchholz(info.row.original).toFixed(1),
      size: 80,
    },
  ];

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const bBuchholz = calculateBuchholz(b);
    const aBuchholz = calculateBuchholz(a);
    return bBuchholz - aBuchholz;
  });

  const table = useReactTable({
    data: sortedPlayers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="table-container">
      <table className="compact-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={{ width: header.getSize() }}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};