// src/components/QuestionMapping.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1) EXACT Bloom’s Verbs from your reference image, grouped by level
const bloomKeywords = {
  Remembering: [
    "define","describe","examine","identify","label","list","locate","match",
    "memorize","name","omit","recall","recite","recognize","record","repeat",
    "reproduce","retell","select","state","tabulate","tell","visualize"
  ],
  Understanding: [
    "associate","classify","cite","compare","contrast","convert","describe",
    "differentiate","discover","discuss","distinguish","estimate","explain",
    "express","extend","generalize","give examples","group","identify",
    "illustrate","indicate","infer","interpret","judge","observe","order",
    "paraphrase","predict","relate","report","represent","research","restate",
    "review","rewrite","select","show","summarize","trace","transform","translate"
  ],
  Applying: [
    "apply","articulate","calculate","change","chart","choose",
    "collect","complete","compute","construct","determine","develop","discover",
    "dramatize","employ","establish","examine","experiment","explain","illustrate",
    "interpret","judge","manipulate","modify","operate","practice","predict",
    "prepare","produce","record","relate","report","schedule","simulate","sketch",
    "solve","teach","transfer","write"
  ],
  Analyzing: [
    "analyze","categorize","classify","compare",
    "conclude","connect","contrast","correlate","criticize","deduce","devise",
    "diagram","differentiate","discriminate","dissect","distinguish","divide",
    "estimate","evaluate","examine","explain","focus","illustrate","infer","order",
    "organize","plan","prioritize","select","separate","subdivide","survey","test"
  ],
  Evaluating: [
    "appraise","argue","assess","award","choose","compare","conclude",
    "consider","convince","criticize","critique","debate","decide","defend",
    "determine","discriminate","distinguish","editorialize","estimate","evaluate",
    "find errors","grade","judge","justify","measure","order","persuade","predict",
    "rank","rate","recommend","reframe","score","select","summarize","support",
    "test","weigh"
  ],
  Creating: [
    "adapt","assemble","compose",
    "construct","create","delete","design","develop","discuss","elaborate","estimate",
    "express","facilitate","formulate","generalize","happen","hypothesize","infer",
    "integrate","intervene","invent","justify","manage","maximize","minimize",
    "modify","negotiate","originate","plan","prepare","produce","propose",
    "rearrange","reorganize","report","revise","rewrite","role-play","simulate",
    "solve","speculate","structure","suppose","test","theory","validate","write"
  ]
};

function QuestionMapping() {
  const [questions, setQuestions] = useState([]);

  // 2) The form data includes level and keywords (and optional CO/PO)
  const [formData, setFormData] = useState({
    question_no: '',
    level: '',
    keywords: '',
    specification: '',
    co: '',
    po: ''
  });

  // Fetch existing questions on mount
  const fetchQuestions = async () => {
    try {
      // Use a relative path if you're deployed (Render) and serving the backend at the same domain
      const res = await axios.get('/api/questions');
      setQuestions(res.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 3) Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4) Submit the new question
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/questions', formData);
      // Reset form
      setFormData({
        question_no: '',
        level: '',
        keywords: '',
        specification: '',
        co: '',
        po: ''
      });
      // Refresh the question list
      fetchQuestions();
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  // 5) Based on the selected level, get the array of possible keywords
  const possibleKeywords = bloomKeywords[formData.level] || [];

  return (
    <div>
      <h3>Question Mapping</h3>
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        {/* Question No */}
        <div className="col-md-2">
          <label className="form-label">Question No</label>
          <input
            className="form-control"
            name="question_no"
            value={formData.question_no}
            onChange={handleChange}
            required
          />
        </div>

        {/* Level Dropdown */}
        <div className="col-md-2">
          <label className="form-label">Level</label>
          <select
            className="form-select"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Level --</option>
            <option value="Remembering">Remembering</option>
            <option value="Understanding">Understanding</option>
            <option value="Applying">Applying</option>
            <option value="Analyzing">Analyzing</option>
            <option value="Evaluating">Evaluating</option>
            <option value="Creating">Creating</option>
          </select>
        </div>

        {/* Keywords Dropdown (populated based on level) */}
        <div className="col-md-2">
          <label className="form-label">Keywords</label>
          <select
            className="form-select"
            name="keywords"
            value={formData.keywords}
            onChange={handleChange}
            required
            disabled={!formData.level} // disable if no level selected
          >
            <option value="">-- Select Keyword --</option>
            {possibleKeywords.map((keyword) => (
              <option key={keyword} value={keyword}>
                {keyword}
              </option>
            ))}
          </select>
        </div>

        {/* Specification */}
        <div className="col-md-2">
          <label className="form-label">Specification</label>
          <input
            className="form-control"
            name="specification"
            value={formData.specification}
            onChange={handleChange}
          />
        </div>

        {/* CO (optional) */}
        <div className="col-md-2">
          <label className="form-label">CO (optional)</label>
          <input
            className="form-control"
            name="co"
            value={formData.co}
            onChange={handleChange}
          />
        </div>

        {/* PO (optional) */}
        <div className="col-md-2">
          <label className="form-label">PO (optional)</label>
          <input
            className="form-control"
            name="po"
            value={formData.po}
            onChange={handleChange}
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-success">
            Add Question
          </button>
        </div>
      </form>

      <h5>Existing Questions</h5>
      <ul className="list-group">
        {questions.map((q) => (
          <li key={q.id} className="list-group-item">
            <strong>Q{q.question_no}</strong> - {q.level} | {q.keywords} | {q.specification}
            {q.co && ` | CO: ${q.co}`}
            {q.po && ` | PO: ${q.po}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionMapping;
