import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@olnktr/ui";
import { getServerApi, requireSession } from "~/lib/server";
import { PlanActions } from "~/modules/billing/plan-actions";

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  const { checkout } = await searchParams;
  const t = await getTranslations("billing");
  const format = await getFormatter();
  const api = await getServerApi();
  const [summary, plans, payments] = await Promise.all([
    api.billing.summary({}),
    api.billing.plans(),
    api.billing.payments({}),
  ]);
  const currency = (amount: number, code: string) =>
    format.number(amount / 100, { style: "currency", currency: code });

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {checkout === "success" ? <Alert variant="success">{t("checkoutSuccess")}</Alert> : null}
      {checkout === "canceled" ? (
        <Alert variant="destructive">{t("checkoutCanceled")}</Alert>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{t("currentPlan")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold capitalize" data-testid="current-plan">
              {summary.plan.key}
            </span>
            {summary.subscription ? (
              <Badge variant="secondary">{summary.subscription.status}</Badge>
            ) : null}
          </div>
          {summary.subscription?.currentPeriodEnd ? (
            <span className="text-muted-foreground">
              {t("renews", {
                date: format.dateTime(summary.subscription.currentPeriodEnd, {
                  dateStyle: "medium",
                }),
              })}
            </span>
          ) : null}
          {summary.subscription?.cancelAtPeriodEnd ? <span>{t("canceled")}</span> : null}
        </CardContent>
      </Card>
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">{t("plans")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const monthly =
              plan.prices.find((price) => price.interval === "month" && price.currency === "USD") ??
              plan.prices.find((price) => price.interval === "month");
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <span className="text-xl font-semibold">
                    {monthly
                      ? t("perMonth", { price: currency(monthly.amount, monthly.currency) })
                      : t("free")}
                  </span>
                  {plan.trialDays > 0 ? (
                    <Badge variant="outline">{t("trial", { days: plan.trialDays })}</Badge>
                  ) : null}
                  <PlanActions
                    planKey={plan.key}
                    isCurrent={summary.plan.key === plan.key}
                    isDefault={plan.isDefault}
                    hasSubscription={Boolean(summary.subscription && summary.source !== "default")}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">{t("payments")}</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
        ) : null}
        <ul className="grid gap-2 text-sm">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex justify-between rounded-md border border-border px-3 py-2"
            >
              <span>{format.dateTime(payment.occurredAt, { dateStyle: "medium" })}</span>
              <span>{currency(payment.amount, payment.currency)}</span>
              <Badge variant={payment.status === "succeeded" ? "secondary" : "outline"}>
                {payment.status}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
