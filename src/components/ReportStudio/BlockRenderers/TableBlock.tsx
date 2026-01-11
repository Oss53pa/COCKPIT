/**
 * Table Block Component
 */

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { TableBlock as TableBlockType, ContentBlock, TableRow } from '../../../types/reportStudio';

interface TableBlockProps {
  block: TableBlockType;
  isEditable: boolean;
  onChange: (updates: Partial<ContentBlock>) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isEditable,
  onChange,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = block.config.pageSize || 10;

  const handleSort = (columnKey: string) => {
    if (!block.config.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortedRows = (): TableRow[] => {
    if (!sortColumn) return block.rows;

    return [...block.rows].sort((a, b) => {
      const aValue = a[sortColumn]?.value ?? '';
      const bValue = b[sortColumn]?.value ?? '';

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  };

  const getPaginatedRows = (): TableRow[] => {
    const sorted = getSortedRows();
    if (!block.config.pagination) return sorted;

    const startIndex = (currentPage - 1) * pageSize;
    return sorted.slice(startIndex, startIndex + pageSize);
  };

  const totalPages = Math.ceil(block.rows.length / pageSize);
  const displayRows = getPaginatedRows();

  const formatCellValue = (value: string | number | null, format?: string): string => {
    if (value === null) return '-';

    switch (format) {
      case 'currency':
        return typeof value === 'number'
          ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
          : String(value);
      case 'percentage':
        return typeof value === 'number'
          ? `${(value * 100).toFixed(1)}%`
          : String(value);
      case 'number':
        return typeof value === 'number'
          ? new Intl.NumberFormat('fr-FR').format(value)
          : String(value);
      case 'date':
        return value ? new Date(String(value)).toLocaleDateString('fr-FR') : '-';
      default:
        return String(value);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-primary-200">
      <div className="overflow-x-auto">
        <table className={`w-full ${block.config.compact ? 'text-sm' : ''}`}>
          <thead className="bg-primary-50">
            <tr>
              {block.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-4 py-3 text-left font-semibold text-primary-900 ${
                    header.sortable && block.config.sortable ? 'cursor-pointer hover:bg-primary-100' : ''
                  } ${header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''}`}
                  style={{ width: header.width ? `${header.width}px` : undefined }}
                  onClick={() => header.sortable && handleSort(header.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{header.label}</span>
                    {header.sortable && block.config.sortable && sortColumn === header.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  block.config.striped && rowIndex % 2 === 1 ? 'bg-primary-25' : ''
                } ${block.config.bordered ? 'border-t border-primary-200' : ''}`}
              >
                {block.headers.map((header) => {
                  const cell = row[header.key];
                  return (
                    <td
                      key={header.id}
                      className={`px-4 py-3 ${
                        header.align === 'center' ? 'text-center' : header.align === 'right' ? 'text-right' : ''
                      }`}
                      style={{
                        backgroundColor: cell?.style?.backgroundColor,
                        color: cell?.style?.color,
                        fontWeight: cell?.style?.fontWeight,
                      }}
                    >
                      {cell?.formatted || formatCellValue(cell?.value ?? null, header.format)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {block.config.pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-primary-200 bg-primary-50">
          <span className="text-sm text-primary-600">
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, block.rows.length)} sur {block.rows.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-primary-200 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-primary-200 rounded hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
