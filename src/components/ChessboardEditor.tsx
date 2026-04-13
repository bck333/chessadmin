'use client';

import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Eraser, PlayCircle, Settings2, Undo2, Flag } from 'lucide-react';

interface ChessboardEditorProps {
  onFenChange: (fen: string) => void;
  initialFen?: string;
  mode?: 'setup' | 'record';
  onModeChange?: (mode: 'setup' | 'record') => void;
  recordedMoves?: string[];
  onRecordedMovesChange?: (moves: string[]) => void;
  lastMove?: string;
  onLastMoveChange?: (move: string) => void;
}

export function ChessboardEditor({ 
  onFenChange, 
  initialFen,
  mode = 'setup',
  onModeChange,
  recordedMoves = [],
  onRecordedMovesChange,
  lastMove = '',
  onLastMoveChange
}: ChessboardEditorProps) {
  const [game, setGame] = useState(new Chess(initialFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
  const [fen, setFen] = useState(game.fen());
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  useEffect(() => {
    onFenChange(fen);
  }, [fen, onFenChange]);

  const updatePosition = (newGame: Chess) => {
    setGame(newGame);
    setFen(newGame.fen());
  };

  const onDrop = ({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
    if (mode === 'setup') {
      // If targetSquare is null (dragged off board), remove it
      if (!targetSquare) {
        const newGame = new Chess(fen);
        newGame.remove(sourceSquare as any);
        updatePosition(newGame);
        return true;
      }

      // Manual piece placement on drop
      const newGame = new Chess(fen);
      const color = piece.pieceType[0] === 'w' ? 'w' : 'b';
      const type = piece.pieceType[1].toLowerCase();

      newGame.remove(sourceSquare as any);
      newGame.put({ type, color } as any, targetSquare as any);
      updatePosition(newGame);
      return true;
    } else {
      // RECORD MODE
      if (!targetSquare) return false;
      const newGame = new Chess(fen);
      try {
        const move = newGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: 'q', // always promote to queen for simplicity
        });
        
        if (move) {
          updatePosition(newGame);
          const uciMove = move.from + move.to + (move.promotion || '');
          
          if (recordedMoves.length === 0 && !lastMove && onLastMoveChange) {
             // Ask user if this is the lastMove or solution start? 
             // We'll just assume the very first move is lastMove if it's empty, 
             // OR give them a button to "Mark as LastMove". Let's handle via UI.
          }
          
          if (onRecordedMovesChange) {
            onRecordedMovesChange([...recordedMoves, uciMove]);
          }
          return true;
        }
      } catch (e) {
        return false;
      }
      return false;
    }
  };

  const onSquareClick = ({ square }: { square: string }) => {
    if (mode === 'record') return; // Don't allow click-placements in record mode
    if (!selectedPiece) return;

    const newGame = new Chess(fen);
    if (selectedPiece === 'eraser') {
      newGame.remove(square as any);
    } else {
      const color = selectedPiece[0] === 'w' ? 'w' : 'b';
      const type = selectedPiece[1].toLowerCase() as any;
      newGame.put({ type, color }, square as any);
    }
    updatePosition(newGame);
  };

  const handleReset = () => {
    const newGame = new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    setGame(newGame);
    setFen(newGame.fen());
  };

  const handleClear = () => {
    const newGame = new Chess('8/8/8/8/8/8/8/8 w - - 0 1');
    setGame(newGame);
    setFen(newGame.fen());
  };

  const pieces = [
    { id: 'wP', label: '♙' }, { id: 'wN', label: '♘' }, { id: 'wB', label: '♗' }, 
    { id: 'wR', label: '♖' }, { id: 'wQ', label: '♕' }, { id: 'wK', label: '♔' },
    { id: 'bP', label: '♟' }, { id: 'bN', label: '♞' }, { id: 'bB', label: '♝' }, 
    { id: 'bR', label: '♜' }, { id: 'bQ', label: '♛' }, { id: 'bK', label: '♚' },
  ];

  const handleUndo = () => {
    if (mode === 'record' && recordedMoves.length > 0) {
      const newGame = new Chess(fen);
      newGame.undo();
      updatePosition(newGame);
      if (onRecordedMovesChange) {
        onRecordedMovesChange(recordedMoves.slice(0, -1));
      }
    }
  };

  const handleMarkLastMove = () => {
    if (mode === 'record' && recordedMoves.length > 0 && onLastMoveChange && onRecordedMovesChange) {
      // Take the first move from the sequence and make it the last move
      const move = recordedMoves[0];
      onLastMoveChange(move);
      onRecordedMovesChange(recordedMoves.slice(1));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-[400px] h-[400px] shadow-xl border-4 border-gray-100 rounded-lg overflow-hidden cursor-crosshair">
        <Chessboard 
          options={{
            position: fen,
            onPieceDrop: onDrop,
            onSquareClick: onSquareClick,
            boardOrientation: "white",
            darkSquareStyle: { backgroundColor: '#779556' },
            lightSquareStyle: { backgroundColor: '#ebecd0' },
            animationDurationInMs: 200
          }}
        />
      </div>

      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => onModeChange && onModeChange('setup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              mode === 'setup' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings2 size={16} /> SETUP BOARD
          </button>
          <button
            onClick={() => onModeChange && onModeChange('record')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
              mode === 'record' ? 'bg-blue-600 shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PlayCircle size={16} /> RECORD MOVES
          </button>
        </div>

        {mode === 'setup' && (
          <>
            <div className="text-sm font-semibold text-gray-700 mt-2">Piece Palette</div>
            <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              {pieces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPiece(selectedPiece === p.id ? null : p.id)}
                  className={`text-2xl h-12 w-12 flex items-center justify-center rounded-lg transition-all ${
                    selectedPiece === p.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedPiece(selectedPiece === 'eraser' ? null : 'eraser')}
                className={`h-12 w-12 flex items-center justify-center rounded-lg transition-all ${
                  selectedPiece === 'eraser' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'bg-white hover:bg-gray-100 text-red-600 border border-gray-200'
                }`}
                title="Eraser Tool"
              >
                <Eraser size={20} />
              </button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline"
                onClick={handleReset}
                className="flex-1 bg-white hover:bg-gray-50 border-gray-200 gap-2"
              >
                <RotateCcw size={16} />
                Reset Board
              </Button>
              <Button 
                variant="outline"
                onClick={handleClear}
                className="flex-1 bg-white hover:bg-gray-50 border-gray-200 gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
                Clear Board
              </Button>
            </div>
          </>
        )}

        {mode === 'record' && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-4">
            <p className="text-xs font-medium text-blue-800">
              Moves are strictly validated. Drag pieces on the board to record your solution sequence.
            </p>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  onClick={handleUndo}
                  disabled={recordedMoves.length === 0}
                  className="flex-1 bg-white text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-sm gap-2"
                >
                  <Undo2 size={16} /> Undo Move
                </Button>
                <Button 
                  onClick={handleMarkLastMove}
                  disabled={recordedMoves.length === 0}
                  className="flex-1 bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-sm gap-2 text-xs"
                >
                  <Flag size={16} /> Set First As LastMove
                </Button>
              </div>
            </div>
            
            {(recordedMoves.length > 0 || lastMove) && (
              <div className="mt-4 bg-white p-3 rounded-lg border border-blue-100 text-sm font-mono text-slate-700">
                {lastMove && <div className="text-gray-400 mb-1">LastMove: <span className="text-blue-600 font-bold">{lastMove}</span></div>}
                <div>Sequence: {recordedMoves.join(', ') || '...'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p className="text-xs font-mono break-all text-gray-400 select-all">
          <span className="font-bold text-gray-500 mr-2">FEN:</span>
          {fen}
        </p>
      </div>
    </div>
  );
}
