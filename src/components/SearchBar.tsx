import { ActionIcon, Button, Group, TextInput } from "@mantine/core";
import React from "react";
import { ID_REGEX } from "../main";
import { useNavigate } from "react-router";
import { IconSearch } from "@tabler/icons-react";

type Props = {
	loading: boolean;
}

export default function SearchBar({ loading }: Props) {
	const [inputValue, setInputValue] = React.useState("");
	const [inputError, setInputError] = React.useState(false);
	const [inputFocused, setInputFocused] = React.useState<boolean>(false);

	const [initialLoad, setInitialLoad] = React.useState<boolean>(false);

	const searchButtonRef = React.useRef<HTMLButtonElement>(null);

	const navigate = useNavigate();

	React.useEffect(() => {
		if (!initialLoad) {
			setInitialLoad(true);
			const search = new URLSearchParams(window.location.search).get("q");
			if (search) setInputValue(search);

			document.addEventListener("keydown", e => {
				if (e.repeat) return;
				if (e.key === "Enter") {
					searchButtonRef.current?.click();
				}
			});

			if (inputError && inputFocused) setInputError(false);
		}
	});

	return (
		<Group justify="center">
			<TextInput
				value={inputValue}
				name="wrestler-search"
				onChange={e => setInputValue(e.currentTarget.value)}
				placeholder="Enter name or ID..."
				error={inputError}
				onFocus={() => setInputFocused(true)}
				onBlur={() => setInputFocused(false)}
				size="md"
			/>
			<ActionIcon
				variant="outline"
				loading={loading}
				onClick={() => {
					if (!inputValue) {
						setInputError(true);
					} else {
						const test = ID_REGEX.exec(inputValue);
						if (!test) {
							// void searchFor(inputValue);
							navigate(`/search?q=${inputValue}`);
						} else {
							// void downloadData(test[0]);
							navigate(`/athlete/${test[0]}`);
						}
					}
				}}
				ref={searchButtonRef}
				h={40}
				w={40}
			>
				<IconSearch />
			</ActionIcon>
		</Group>
	)
}