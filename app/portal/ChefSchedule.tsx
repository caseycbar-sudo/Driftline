"use client";
import { useEffect, useMemo, useState } from "react";

type Dish = {
  title: string;
  source: string;
  image: string;
  ingredients: string[];
  allergens: string[];
};
type Job = {
  id: number;
  serviceDate: string;
  startTime: string;
  endTime: string;
  household: string;
  chef: string;
  packageName: string;
  location: string;
  status: string;
  notes: string;
  dishes: Dish[];
};

export default function ChefSchedule() {
  const [jobs, setJobs] = useState<Job[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [open, setOpen] = useState<number | null>(null),
    [checked, setChecked] = useState<Record<string, boolean>>({});
  useEffect(() => {
    fetch("/api/chef/schedule")
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          window.location.href = "/signin-with-chatgpt?return_to=%2Fchef%2Fworkspace";
          throw new Error("Sign in required");
        }
        if (!response.ok) throw new Error("Could not load upcoming jobs");
        return response.json();
      })
      .then((data: Job[]) => {
        setJobs(data);
        setOpen(data[0]?.id ?? null);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);
  const next = useMemo(() => jobs[0], [jobs]);
  if (loading)
    return <div className="chef-schedule-state">Loading upcoming jobs…</div>;
  if (error) return <div className="chef-schedule-state error">{error}</div>;
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Upcoming jobs</h1>
          <p>
            Your assigned visits, menus, and shopping lists for the next 90
            days.
          </p>
        </div>
        {next ? (
          <div className="next-job-badge">
            <small>NEXT JOB</small>
            <strong>
              {new Date(`${next.serviceDate}T12:00:00`).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}{" "}
              · {next.startTime}
            </strong>
          </div>
        ) : null}
      </header>
      <div className="page-body">
        {jobs.length === 0 ? (
          <div className="chef-schedule-state">
            <strong>No upcoming jobs assigned</strong>
            <p>
              New visits will appear here when operations assigns them to your
              staff account.
            </p>
          </div>
        ) : (
          <div className="chef-job-list">
            {jobs.map((job) => {
              const expanded = open === job.id;
              return (
                <article key={job.id} className={expanded ? "open" : ""}>
                  <button
                    className="chef-job-head"
                    onClick={() => setOpen(expanded ? null : job.id)}
                  >
                    <time>
                      <b>
                        {new Date(
                          `${job.serviceDate}T12:00:00`,
                        ).toLocaleDateString("en-US", { weekday: "short" })}
                      </b>
                      <strong>
                        {new Date(`${job.serviceDate}T12:00:00`).getDate()}
                      </strong>
                      <small>
                        {new Date(
                          `${job.serviceDate}T12:00:00`,
                        ).toLocaleDateString("en-US", { month: "short" })}
                      </small>
                    </time>
                    <span>
                      <small>
                        {job.startTime}
                        {job.endTime ? `–${job.endTime}` : ""} ·{" "}
                        {job.status.replace("-", " ")}
                      </small>
                      <strong>{job.household}</strong>
                      <p>
                        {job.packageName} · {job.location || "Location pending"}
                      </p>
                    </span>
                    <b>
                      {job.dishes.length} dish
                      {job.dishes.length === 1 ? "" : "es"}{" "}
                      {expanded ? "⌃" : "⌄"}
                    </b>
                  </button>
                  {expanded ? (
                    <div className="chef-job-detail">
                      {job.notes ? (
                        <div className="chef-job-note">
                          <b>OPERATIONS NOTES</b>
                          <p>{job.notes}</p>
                        </div>
                      ) : null}
                      <h2>Menu for this visit</h2>
                      {job.dishes.length === 0 ? (
                        <p className="chef-no-menu">
                          No dishes have been attached yet. Check with
                          operations before shopping.
                        </p>
                      ) : (
                        <div className="chef-dish-list">
                          {job.dishes.map((dish, dishIndex) => (
                            <section key={`${dish.title}-${dishIndex}`}>
                              <header>
                                {dish.image ? (
                                  <img src={dish.image} alt="" />
                                ) : (
                                  <span>DR</span>
                                )}
                                <div>
                                  <strong>{dish.title}</strong>
                                  <small>
                                    {dish.source}
                                    {dish.allergens.length
                                      ? ` · Allergens: ${dish.allergens.join(", ")}`
                                      : ""}
                                  </small>
                                </div>
                              </header>
                              <h3>Ingredients to get</h3>
                              {dish.ingredients.length ? (
                                <ul>
                                  {dish.ingredients.map((ingredient, index) => {
                                    const key = `${job.id}-${dish.title}-${index}`;
                                    return (
                                      <li key={key}>
                                        <label>
                                          <input
                                            type="checkbox"
                                            checked={Boolean(checked[key])}
                                            onChange={() =>
                                              setChecked((current) => ({
                                                ...current,
                                                [key]: !current[key],
                                              }))
                                            }
                                          />
                                          <span>{ingredient}</span>
                                        </label>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p className="chef-no-menu">
                                  Ingredient details need to be confirmed with
                                  operations.
                                </p>
                              )}
                            </section>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
