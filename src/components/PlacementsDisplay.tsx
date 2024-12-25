
import { Accordion, Card, Stack, Table, Text, Title } from "@mantine/core";
import { WrestlerObject } from "../api/types/objects/wrestler";
import { AllBoutRelationships, AllWrestlerRelationships } from "../api/types/relationships";
import { WrestlersResponse } from "../api/types/responses";
import { FloObject } from "../api/types/types";
import { BoutObject } from "../api/types/objects/bout";
import { BracketPlacementObject } from "../api/types/objects/bracketPlacement";
import { DivisionObject } from "../api/types/objects/division";
import { EventObject } from "../api/types/objects/event";
import { GradeObject } from "../api/types/objects/grade";
import { RoundNameObject } from "../api/types/objects/roundName";
import { TeamObject } from "../api/types/objects/team";
import { WeightClassObject } from "../api/types/objects/weightClass";
import FloAPI from "../api/FloAPI";

import styles from "./PlacementsDisplay.module.css";
import dayjs from "dayjs";

export type PlacementsDisplayProps = {
	athleteId: string;
	wrestlers: WrestlersResponse<AllWrestlerRelationships, BoutObject | DivisionObject | EventObject | GradeObject | RoundNameObject | TeamObject | WeightClassObject | BracketPlacementObject> | null,
	startDate?: Date | null,
	endDate?: Date | null,
};

export default function PlacementsDisplay({ athleteId, wrestlers, startDate, endDate }: PlacementsDisplayProps) {
	return (
		<Accordion>
			{wrestlers?.data.map(wrestler => {
				//const wrestler = wrestlers.data.find(w => w.id == placement.attributes.wrestlerId);
				const placement = wrestler?.relationships.bracketPlacements.data.length ? FloAPI.findIncludedObjectById<BracketPlacementObject>(wrestler.relationships.bracketPlacements.data[0].id, "bracketPlacement", wrestlers) : null;
				console.log({placement});
				const event = FloAPI.findIncludedObjectById<EventObject>(wrestler.attributes.eventId, "event", wrestlers);
				const weightClass = wrestler ? FloAPI.findIncludedObjectById<WeightClassObject>(wrestler.relationships.weightClass.data.id, "weightClass", wrestlers) : null;
				const division = wrestler ? FloAPI.findIncludedObjectById<DivisionObject>(wrestler.relationships.division.data.id, "division", wrestlers) : null;
				return (
					<Accordion.Item key={wrestler.id} value={wrestler.id}>
						<Card className={styles.card}>
							<Accordion.Control>
								<Stack direction="horizontal" gap="xs" content="center" ta="center">
									<Title order={4} style={{ marginBottom: 0 }}>{event?.attributes.name}</Title>
									<Text size="xl" fw={placement?.attributes.placement == 1 ? 600 : 400} c={placement?.attributes.placement == 1 ? "var(--mantine-color-green-4)" : placement?.attributes.placement == 2 ? "var(--mantine-color-green-3)" : placement?.attributes.placement == 3 ? "var(--mantine-color-green-2)" : "var(--mantine-color-red-4)"}>
										{placement?.attributes.placementDisplay ?? "DNP"}</Text>
									<Text size="md" style={{marginBottom: 0 }}>{division?.attributes.name} {weightClass?.attributes.name} {division?.attributes.measurementUnit}</Text>
								</Stack>
							</Accordion.Control>
						</Card>
					</Accordion.Item>
				)
			})}
		</Accordion>
	)
}