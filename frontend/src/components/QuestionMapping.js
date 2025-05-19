// src/components/QuestionMapping.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1) Bloom’s verbs grouped by level
const bloomKeywords = {
  Remembering: [
    "define",
    "describe",
    "examine",
    "identify",
    "label",
    "list",
    "locate",
    "match",
    "memorize",
    "recall",
    "recite",
    "recognize",
    "record",
    "reproduce",
    "retell",
    "select",
    "state",
    "tabulate",
    "tell",
    "visualize"
  ],

  Understanding: [
    "associate",
    "classify",
    "compare",
    "contrast",
    "convert",
    "describe",
    "discuss",
    "distinguish",
    "explain",
    "generalize",
    "give examples",
    "group",
    "illustrate",
    "interpret",
    "order",
    "paraphrase",
    "predict",
    "relate",
    "report",
    "represent",
    "research",
    "restate",
    "review",
    "rewrite",
    "select",
    "show",
    "summarize",
    "trace",
    "transform",
    "translate"
  ],

  Applying: [
    "apply",
    "articulate",
    "calculate",
    "change",
    "chart",
    "choose",
    "compute",
    "construct",
    "demonstrate",
    "employ",
    "examine",
    "experiment",
    "illustrate",
    "implement",
    "interpret",
    "manipulate",
    "modify",
    "operate",
    "practice",
    "predict",
    "produce",
    "relate",
    "report",
    "schedule",
    "sketch",
    "solve",
    "transfer"
  ],

  Analyzing: [
    "analyze",
    "categorize",
    "classify",
    "compare",
    "contrast",
    "deduce",
    "diagram",
    "differentiate",
    "discriminate",
    "dissect",
    "distinguish",
    "divide",
    "estimate",
    "experiment",
    "identify",
    "infer",
    "inspect",
    "order",
    "organize",
    "prioritize",
    "question",
    "separate",
    "survey",
    "test"
  ],

  Evaluating: [
    "appraise",
    "argue",
    "assess",
    "choose",
    "compare",
    "conclude",
    "criticize",
    "critique",
    "debate",
    "defend",
    "determine",
    "discriminate",
    "distinguish",
    "estimate",
    "evaluate",
    "grade",
    "judge",
    "justify",
    "measure",
    "predict",
    "rank",
    "rate",
    "recommend",
    "reframe",
    "summarize",
    "support"
  ],

  Creating: [
    "adapt",
    "assemble",
    "compose",
    "construct",
    "create",
    "design",
    "develop",
    "elaborate",
    "formulate",
    "generalize",
    "generate",
    "hypothesize",
    "imagine",
    "improve",
    "invent",
    "make up",
    "maximize",
    "minimize",
    "manage",
    "modify",
    "originate",
    "plan",
    "prepare",
    "produce",
    "propose",
    "rearrange",
    "reorganize",
    "revise",
    "role-play",
    "speculate",
    "structure",
    "test",
    "validate"
  ]
}

export default function QuestionMapping() {
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    question_no: '',
    question_text: '',
    level: '',
    keywords: [],
    specification: '',
    co: '',
    po: ''
  });
  // hold any user‐added keywords for the current question
  const [customKeywords, setCustomKeywords] = useState([]);
  const [pendingKeyword, setPendingKeyword] = useState('');
  const [editId, setEditId] = useState(null);

  // load existing questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get('/api/questions');
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
    }
  };

  // generic change
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'level') {
      // clear keywords & customKeywords when level changes
      setCustomKeywords([]);
      setFormData(fd => ({ ...fd, level: value, keywords: [] }));
    } else {
      setFormData(fd => ({ ...fd, [name]: value }));
    }
  };

  // toggle any checkbox
  const handleKeywordToggle = e => {
    const { value, checked } = e.target;
    setFormData(fd => {
      const kws = checked
        ? [...fd.keywords, value]
        : fd.keywords.filter(k => k !== value);
      return { ...fd, keywords: kws };
    });
  };

  // add a custom keyword
  const handleAddCustom = () => {
    const kw = pendingKeyword.trim();
    if (!kw) return;
    if (
      bloomKeywords[formData.level]?.includes(kw) ||
      customKeywords.includes(kw)
    ) {
      setPendingKeyword('');
      return;
    }
    setCustomKeywords(ca => [...ca, kw]);
    setFormData(fd => ({ ...fd, keywords: [...fd.keywords, kw] }));
    setPendingKeyword('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.question_no.trim() || !formData.question_text.trim()) {
      return alert('Enter Q No and Question Text');
    }
    const payload = {
      ...formData,
      keywords: formData.keywords.join(', ')
    };
    try {
      if (editId) {
        await axios.put(`/api/questions/${editId}`, {
          ...formData,
          keywords: formData.keywords.join(', ')
        });
        setEditId(null);
      } else {
        await axios.post('/api/questions', {
          ...formData,
          keywords: formData.keywords.join(', ')
        });
      }
      setFormData({
        question_no: '',
        question_text: '',
        level: '',
        keywords: [],
        specification: '',
        co: '',
        po: ''
      });
      setCustomKeywords([]);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert('Failed to add question');
    }
  };

 // ** delete handler **
 const handleDelete = async (id) => {
   if (!window.confirm('Really delete this question (and all its mappings & scores)?')) return;
   try {
     await axios.delete(`/api/questions/${id}`);
     fetchQuestions();
   } catch(err) {
     console.error(err);
     alert('Delete failed');
   }
 };

 // ** edit handler – prefill form & set editId **
 const handleEdit = (q) => {
   setEditId(q.id);
   setFormData({
     question_no:   q.question_no || '',
     question_text: q.question_text,
     level:         q.level || '',
     keywords:      q.keywords ? q.keywords.split(',').map(k=>k.trim()) : [],
     specification: q.specification || '',
     co:            q.co || '',
     po:            q.po || ''
   });
   setCustomKeywords([]);  // or re-derive from q.keywords
 };

  // combine official + custom for checkboxes
  const possible = [
    ...(bloomKeywords[formData.level] || []),
    ...customKeywords
  ];

  return (
    <div>
      <h3>Question Mapping</h3>
           {/* show whether we’re editing or adding */}
   <h5>{editId ? 'Edit Question' : 'Add New Question'}</h5>

      {/* Question text */}
      <div className="mb-3">
        <label className="form-label">Question Text *</label>
        <textarea
          name="question_text"
          className="form-control"
          rows={3}
          value={formData.question_text}
          onChange={handleChange}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="row g-3 mb-4 align-items-start"
      >
        {/* Q No */}
        <div className="col-md-1">
          <label className="form-label">Q No. *</label>
          <input
            name="question_no"
            className="form-control"
            value={formData.question_no}
            onChange={handleChange}
          />
        </div>

        {/* Level */}
        <div className="col-md-2">
          <label className="form-label">Level</label>
          <select
            name="level"
            className="form-select"
            value={formData.level}
            onChange={handleChange}
          >
            <option value="">— none —</option>
            {Object.keys(bloomKeywords).map(lvl => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Keywords with checkboxes + custom add */}
        <div className="col-md-4">
          <label className="form-label">Keywords</label>

          {/* custom add */}
          <div className="input-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Add custom"
              value={pendingKeyword}
              onChange={e => setPendingKeyword(e.target.value)}
              disabled={!formData.level}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleAddCustom}
              disabled={!pendingKeyword.trim() || !formData.level}
            >
              Add
            </button>
          </div>

          {/* checkbox list */}
          <div
            className="border rounded p-2"
            style={{ maxHeight: 180, overflowY: 'auto' }}
          >
            {formData.level ? (
              possible.map(kw => (
                <div className="form-check" key={kw}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`kw-${kw}`}
                    value={kw}
                    checked={formData.keywords.includes(kw)}
                    onChange={handleKeywordToggle}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`kw-${kw}`}
                  >
                    {kw}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-muted">
                Please select a level first
              </div>
            )}
          </div>
        </div>

        {/* Specification */}
        <div className="col-md-2">
          <label className="form-label">Specification</label>
          <input
            name="specification"
            className="form-control"
            value={formData.specification}
            onChange={handleChange}
          />
        </div>

        {/* CO */}
        <div className="col-md-1">
          <label className="form-label">CO</label>
          <input
            name="co"
            className="form-control"
            value={formData.co}
            onChange={handleChange}
          />
        </div>

        {/* PO */}
        <div className="col-md-1">
          <label className="form-label">PO</label>
          <input
            name="po"
            className="form-control"
            value={formData.po}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <div className="col-md-1 d-grid">
        <button type="submit" className="btn btn-success mt-4">
           {editId ? 'Save Changes' : 'Add'}
         </button>
        </div>
      </form>

      {/* Existing Questions */}
      <h5>Existing Questions</h5>
      <ul className="list-group">
        {questions.map(q => (
          <li key={q.id} className="list-group-item position-relative">
            <strong>Q{q.question_no}:</strong> {q.question_text}
            <br />
            <small className="text-muted">
              {q.level && `${q.level} | `}
              {q.keywords && `${q.keywords} | `}
              {q.specification && `${q.specification} | `}
              {q.co && `CO: ${q.co} | `}
              {q.po && `PO: ${q.po}`}
            </small>
            {/* ——— Edit/Delete buttons ——— */}
            <div
            className="position-absolute d-flex gap-2"
            style={{ bottom: '10px', right: '10px' }}
          >
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleEdit(q)}
            >
              Edit
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(q.id)}
            >
              Delete
            </button>
          </div>
          </li>
        ))}
      </ul>
    </div>
  );
}