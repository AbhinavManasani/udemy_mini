import { useState } from 'react';
import { FiCheck, FiX, FiAward } from 'react-icons/fi';

export default function QuizPlayer({ quiz, onSubmit }) {
  const [answers, setAnswers] = useState(Array(quiz.questions.length).fill(-1));
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qi, oi) => {
    if (submitted) return;
    const next = [...answers];
    next[qi] = oi;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (onSubmit) {
      const res = await onSubmit(answers);
      setResult(res);
    }
  };

  const handleRetry = () => {
    setAnswers(Array(quiz.questions.length).fill(-1));
    setResult(null);
    setSubmitted(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600"><FiAward className="w-5 h-5" /></div>
        <div>
          <h3 className="font-bold text-lg">{quiz.title}</h3>
          <p className="text-sm text-gray-500">{quiz.questions.length} questions</p>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`mb-6 p-4 rounded-xl border-2 ${result.attempt.score >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} animate-fade-in-up`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${result.attempt.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              {result.attempt.score}%
            </div>
            <div>
              <p className="font-semibold">{result.attempt.score >= 70 ? 'Great job! 🎉' : 'Keep learning! 📚'}</p>
              <p className="text-sm text-gray-600">{result.attempt.correct_answers}/{result.attempt.total_questions} correct</p>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          const resultItem = result?.attempt?.results?.[qi] || result?.results?.[qi];

          return (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-in-up" style={{ animationDelay: `${qi * 0.1}s` }}>
              <p className="font-semibold mb-3">
                <span className="text-brand-500 mr-2">Q{qi + 1}.</span>
                {q.text}
              </p>
              <div className="space-y-2">
                {options.map((opt, oi) => {
                  let cls = 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/50';
                  if (answers[qi] === oi && !submitted) cls = 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20';
                  if (submitted && resultItem) {
                    if (oi === resultItem.correct_answer) cls = 'border-emerald-500 bg-emerald-50';
                    else if (oi === resultItem.user_answer && !resultItem.is_correct) cls = 'border-red-400 bg-red-50';
                  }

                  return (
                    <button key={oi} onClick={() => handleSelect(qi, oi)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${cls} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs shrink-0">
                        {submitted && resultItem && oi === resultItem.correct_answer && <FiCheck className="w-3 h-3 text-emerald-600" />}
                        {submitted && resultItem && oi === resultItem.user_answer && !resultItem.is_correct && <FiX className="w-3 h-3 text-red-500" />}
                        {!submitted && (answers[qi] === oi ? '●' : String.fromCharCode(65 + oi))}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        {!submitted ? (
          <button onClick={handleSubmit} disabled={answers.includes(-1)}
            className="btn-brand disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Answers
          </button>
        ) : (
          <button onClick={handleRetry} className="btn-outline">Try Again</button>
        )}
      </div>
    </div>
  );
}
