import { ProductStrategy } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Rocket, DollarSign, Target, Trophy, Compass, ExternalLink } from "lucide-react";

interface Props {
  strategy: ProductStrategy;
}

export function ProductStrategyView({ strategy }: Props) {
  return (
    <div className="space-y-4">
      {/* What this product is */}
      {(strategy.what_this_product_actually_is || strategy.who_its_for) && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">What this product really is</h3>
          </div>
          {strategy.what_this_product_actually_is && (
            <p className="text-sm font-body text-foreground/90 mb-3">
              {strategy.what_this_product_actually_is}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {strategy.who_its_for && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Who it's for
                </div>
                <p className="text-xs font-body">{strategy.who_its_for}</p>
              </div>
            )}
            {strategy.core_job_to_be_done && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Job to be done
                </div>
                <p className="text-xs font-body">{strategy.core_job_to_be_done}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Feature Ideas */}
      {strategy.feature_ideas?.length ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Feature ideas to ship</h3>
          </div>
          <div className="space-y-3">
            {strategy.feature_ideas.map((f, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-heading font-semibold text-sm">{f.title}</h4>
                  {f.impact && (
                    <Badge variant="secondary" className="text-[9px]">
                      Impact: {f.impact}
                    </Badge>
                  )}
                  {f.effort && (
                    <Badge variant="outline" className="text-[9px]">
                      Effort: {f.effort}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-foreground/80 font-body mb-1">{f.description}</p>
                {f.why_now && (
                  <p className="text-xs text-muted-foreground font-body italic">
                    Why now: {f.why_now}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Growth Ideas */}
      {strategy.growth_ideas?.length ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Growth plays</h3>
          </div>
          <div className="space-y-3">
            {strategy.growth_ideas.map((g, i) => (
              <div key={i} className="border-l-2 border-accent/40 pl-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-heading font-semibold text-sm">{g.title}</h4>
                  {g.channel && (
                    <Badge variant="secondary" className="text-[9px]">{g.channel}</Badge>
                  )}
                  {g.effort && (
                    <Badge variant="outline" className="text-[9px]">Effort: {g.effort}</Badge>
                  )}
                </div>
                <p className="text-xs text-foreground/80 font-body">{g.description}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Monetization Ideas */}
      {strategy.monetization_ideas?.length ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Monetization ideas</h3>
          </div>
          <div className="space-y-3">
            {strategy.monetization_ideas.map((m, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-heading font-semibold text-sm">{m.title}</h4>
                  {m.type && <Badge variant="secondary" className="text-[9px]">{m.type}</Badge>}
                </div>
                <p className="text-xs text-foreground/80 font-body">{m.description}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Competitors */}
      {strategy.competitors?.length ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Competitor landscape</h3>
          </div>
          <div className="space-y-3">
            {strategy.competitors.map((c, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-heading font-semibold text-sm">{c.name}</h4>
                  {c.url && (
                    <a
                      href={c.url.startsWith("http") ? c.url : `https://${c.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      {c.url} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {c.positioning && (
                  <p className="text-xs text-muted-foreground font-body mb-2 italic">
                    "{c.positioning}"
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-2 text-xs font-body">
                  {c.what_they_do_better && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-destructive">
                        They do better
                      </span>
                      <p>{c.what_they_do_better}</p>
                    </div>
                  )}
                  {c.what_this_product_does_better && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-accent">
                        You do better
                      </span>
                      <p>{c.what_this_product_does_better}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Market Gaps */}
      {strategy.market_gaps?.length ? (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Market gaps to own</h3>
          </div>
          <div className="space-y-3">
            {strategy.market_gaps.map((g, i) => (
              <div key={i} className="border-l-2 border-accent/40 pl-3">
                <h4 className="font-heading font-semibold text-sm mb-1">{g.title}</h4>
                <p className="text-xs text-foreground/80 font-body">{g.description}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Positioning */}
      {strategy.positioning_recommendation && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm">Positioning recommendation</h3>
          </div>
          <p className="text-sm font-body text-foreground/90 leading-relaxed">
            {strategy.positioning_recommendation}
          </p>
        </Card>
      )}
    </div>
  );
}