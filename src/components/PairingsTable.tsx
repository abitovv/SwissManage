import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Pairing, Player } from "../tournament";
import React from "react";

interface PairingsTableProps {
  pairings: Pairing[];
  players: Player[];
  round: number;
}

export const PairingsTable = ({ pairings, players, round }: PairingsTableProps) => {
  const columns = [
    {
      header: "#",
      cell: (info: any) => info.row.index + 1,
      size: 40,
    },
    {
      header: "Участник 1",
      cell: (info: any) => {
        const player = players.find(p => p.id === info.row.original.player1Id);
        return player ? `${player.firstName} ${player.lastName} (${player.rating})` : "";
      },
      size: 150,
    },
    {
      header: "vs",
      cell: () => "vs",
      size: 30,
    },
    {
      header: "Участник 2",
      cell: (info: any) => {
        const player = players.find(p => p.id === info.row.original.player2Id);
        return player ? `${player.firstName} ${player.lastName} (${player.rating})` : "BYE";
      },
      size: 150,
    },
  ];

  const table = useReactTable({
    data: pairings.filter(p => p.round === round),
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