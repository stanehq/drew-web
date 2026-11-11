import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/button";
import { PageHero } from "@/components/page-hero";
import { SettingsEditor } from "@/components/dashboard/settings-editor";
import {
  DrewApiError,
  getGuild,
  getGuildChannels,
  getGuildRoles,
  getGuildSettings,
  getSchema,
  isApiConfigured,
} from "@/lib/drew";
import { canEdit, guildLevel, readSession } from "@/lib/session";

export const metadata: Metadata = { title: "Configure server", robots: { index: false } };

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className="pb-28">
      <PageHero eyebrow="Dashboard" title={title}>
        {body}
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/dashboard" variant="secondary">
            Back to your servers
          </ButtonLink>
        </div>
      </PageHero>
    </div>
  );
}

export default async function GuildPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const session = await readSession();
  if (!session) redirect("/dashboard");
  if (!guildLevel(session, guildId)) {
    return <Problem title="No access" body="You don't manage this server, or you started managing it after logging in. Log in again to refresh." />;
  }
  if (!isApiConfigured()) return <Problem title="Unavailable" body="The connection to Drew isn't configured." />;

  const loaded = await Promise.all([
    getGuild(guildId, session.uid),
    getGuildSettings(guildId, session.uid),
    getSchema(),
    getGuildChannels(guildId, session.uid),
    getGuildRoles(guildId, session.uid),
  ]).catch((error: unknown) => error);

  if (!Array.isArray(loaded)) {
    if (loaded instanceof DrewApiError && loaded.status === 404) {
      return <Problem title="Drew isn't here" body="Add Drew to this server to configure it." />;
    }
    return <Problem title="Unavailable" body="Couldn't reach Drew. Try again in a minute." />;
  }
  const [guild, settings, schema, channels, roles] = loaded;
  return (
    <SettingsEditor
      guild={guild}
      schema={schema.fields}
      settings={settings.settings}
      channels={channels.channels}
      roles={roles.roles}
      canEdit={canEdit(session, guildId)}
      csrf={session.csrf}
    />
  );
}
