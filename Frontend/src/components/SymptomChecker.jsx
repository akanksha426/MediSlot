import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { analyzeSymptoms, symptomPrompts } from "../utils/symptomMatcher";

const urgencyStyles = {
  Routine: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Soon: "bg-amber-50 text-amber-700 border-amber-200",
  Priority: "bg-rose-50 text-rose-700 border-rose-200",
};

const SymptomChecker = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const [symptoms, setSymptoms] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const insight = useMemo(() => analyzeSymptoms(symptoms), [symptoms]);
  const matchedDoctorsCount = insight
    ? doctors.filter((doc) => doc.speciality === insight.speciality).length
    : 0;

  const handlePrompt = (prompt) => {
    setSymptoms(prompt);
    setHasInteracted(true);
  };

  const handleFindDoctors = () => {
    if (!insight) {
      setHasInteracted(true);
      return;
    }

    const params = new URLSearchParams({
      symptom: insight.input,
      urgency: insight.urgency,
    });

    if (insight.matchedKeywords.length) {
      params.set("matched", insight.matchedKeywords.join(", "));
    }

    navigate(
      `/doctors/${encodeURIComponent(insight.speciality)}?${params.toString()}`
    );
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative my-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,_#f8fbff_0%,_#ffffff_45%,_#f5f7ff_100%)] px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:px-10">
      <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
            Symptom-guided booking
          </div>

          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Describe what you are feeling and let MediSlot suggest the right specialist.
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            This turns browsing into a guided care path. Users can type symptoms in simple language and jump directly to the most relevant doctors.
          </p>

          <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <label
              htmlFor="symptom-input"
              className="mb-3 block text-sm font-semibold text-slate-800"
            >
              Tell us what is bothering you
            </label>

            <textarea
              id="symptom-input"
              rows="5"
              value={symptoms}
              onChange={(event) => {
                setSymptoms(event.target.value);
                setHasInteracted(true);
              }}
              placeholder="Example: I have had stomach pain, acidity, and nausea for 3 days."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {symptomPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePrompt(prompt)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleFindDoctors}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Find the right doctor
              </button>
              <p className="text-sm text-slate-500">
                Rule-based guidance for better booking decisions.
              </p>
            </div>

            {!insight && hasInteracted && (
              <p className="mt-4 text-sm text-rose-600">
                Add a few symptoms so we can suggest the best specialist.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/30">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">
            Smart recommendation
          </p>

          {insight ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className="text-sm text-slate-400">Recommended specialist</p>
                <h3 className="mt-2 text-3xl font-semibold">{insight.speciality}</h3>
              </div>

              <div
                className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${
                  urgencyStyles[insight.urgency]
                }`}
              >
                {insight.urgency} attention
              </div>

              <p className="text-sm leading-6 text-slate-300">
                {insight.urgencyMessage}
              </p>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm font-medium text-slate-200">Why this match</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {insight.reasons[0]}
                </p>
                {insight.matchedKeywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {insight.matchedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-slate-400">Available doctors</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    {matchedDoctorsCount}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Next step</p>
                  <p className="mt-1 leading-6">{insight.nextStep}</p>
                </div>
              </div>

              {insight.alternatives.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    Also worth considering
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {insight.alternatives.map((item) => (
                      <span
                        key={item.speciality}
                        className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200"
                      >
                        {item.speciality}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4 text-slate-300">
              <p className="text-lg leading-8">
                Symptom guidance will appear here with the best-fit specialist, urgency level, and a direct path to booking.
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">Sample outcome</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  Gastroenterologist
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Suggested when the symptoms are mostly stomach, acidity, nausea, or digestion-related.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SymptomChecker;
