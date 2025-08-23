'use client';

import React from 'react';
import { Question } from '../../lib/api';

interface QuizUIProps {
  currentQuestion: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string;
  onSelectAnswer: (_answer: string) => void;
  onNextQuestion: () => void;
  isLoading: boolean;
}

export function QuizUI({
  currentQuestion,
  currentIndex,
  totalQuestions,
  userAnswer,
  onSelectAnswer,
  onNextQuestion,
  isLoading,
}: QuizUIProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className='container-primary py-6'>
      <div className='card-primary p-8 shadow-moderate hover-lift'>
        <QuizProgressBar 
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          progress={progress}
        />

        <QuestionInfo question={currentQuestion} />

        <QuestionText question={currentQuestion.question} />

        <AnswerChoices 
          choices={currentQuestion.choices}
          userAnswer={userAnswer}
          onSelectAnswer={onSelectAnswer}
        />

        <NextButton 
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          userAnswer={userAnswer}
          isLoading={isLoading}
          onNext={onNextQuestion}
        />
      </div>
    </div>
  );
}

function QuizProgressBar({ 
  currentIndex, 
  totalQuestions, 
  progress 
}: { 
  currentIndex: number;
  totalQuestions: number;
  progress: number;
}) {
  return (
    <div className='mb-6'>
      <div className='flex justify-between text-sm text-slate-600 dark:text-slate-300 mb-2'>
        <span>問題 {currentIndex + 1} / {totalQuestions}</span>
        <span>{Math.round(progress)}% 完了</span>
      </div>
      <div className='progress-bar-animated'>
        <div
          className='progress-fill-animated'
          style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
        ></div>
      </div>
    </div>
  );
}

function QuestionInfo({ question }: { question: Question }) {
  return (
    <div className='mb-6'>
      <div className='flex flex-wrap gap-2 mb-4'>
        <span className='badge-info'>{question.category}</span>
        {question.subcategory && (
          <span className='badge-info px-2 py-1 rounded text-sm'>
            {question.subcategory}
          </span>
        )}
        <span className='badge-warning'>
          難易度 {question.difficulty}
        </span>
      </div>
    </div>
  );
}

function QuestionText({ question }: { question: string }) {
  return (
    <div className='mb-8'>
      <h3 className='heading-secondary mb-4'>問題</h3>
      <p className='text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap'>
        {question}
      </p>
    </div>
  );
}

function AnswerChoices({ 
  choices, 
  userAnswer, 
  onSelectAnswer 
}: { 
  choices: string[];
  userAnswer: string;
  onSelectAnswer: (_answer: string) => void;
}) {
  return (
    <div className='space-y-3 mb-8'>
      {choices.map((choice, index) => {
        const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
        const isSelected = userAnswer === optionLabel;

        return (
          <button
            key={index}
            onClick={() => onSelectAnswer(optionLabel)}
            className={`quiz-card click-shrink focus-ring ${
              isSelected
                ? 'border-primary bg-accent text-primary'
                : 'hover-lift click-shrink'
            }`}
          >
            <span className='font-semibold mr-3'>{optionLabel}.</span>
            {choice}
          </button>
        );
      })}
    </div>
  );
}

function NextButton({ 
  currentIndex, 
  totalQuestions, 
  userAnswer, 
  isLoading, 
  onNext 
}: {
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string;
  isLoading: boolean;
  onNext: () => void;
}) {
  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const canProceed = userAnswer && !isLoading;

  return (
    <div className='text-center'>
      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`btn-large font-semibold hover-lift click-shrink focus-ring ${
          canProceed ? 'btn-primary' : 'interactive-disabled'
        }`}
      >
        {isLastQuestion ? '結果を見る' : '次の問題'}
      </button>
    </div>
  );
}