/// This file is written as a library and can be used by other projects.

import type { FirebaseApp } from "firebase/app";
import type { Database, Unsubscribe } from "firebase/database";

import { initializeApp } from "firebase/app";
import { get, getDatabase, onValue, ref, set, update } from "firebase/database";

import isEqual from "lodash.isequal";

import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
} from "$env/static/public";

let firebase: FirebaseApp;
let database: Database;

export function init() {
	firebase = initializeApp({
		apiKey: PUBLIC_FIREBASE_API_KEY,
		authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
		databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
		projectId: PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
		messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		appId: PUBLIC_FIREBASE_APP_ID,
	});
	database = getDatabase(firebase);
}

export async function createGame() {
	const id = await generateGameId();
	const data = {
		meta: {
			timestamp: Date.now() / 1000,
		},
		globalData: {},
		players: {},
	};
	set(ref(database, id.toString()), data);
	return id;
}

export async function joinGame(id: number, username: string, playerData: any = null) {
	if (playerData == undefined || Object.keys(playerData).length == 0) {
		playerData = { "_": "_" };
	}

	let data = (await get(ref(database, id.toString()))).val();
	if (data == undefined) throw new Error("GameNotFound");
	if (data.players == undefined) data.players = {};
	if (Object.hasOwn(data.players, username)) throw new Error("UsernameAlreadyTaken");

	update(ref(database, id.toString() + "/players"), {
		[username]: playerData,
	});
	data.players[username] = playerData;
	return new Game(id, data, username);
}

async function generateGameId() {
	while (true) {
		let id = Math.round(Math.random() * (9999 - 1000) + 1000);
		let snapshot = await get(ref(database, id.toString()));
		if (snapshot.exists()) {
			if ((Date.now() / 1000) - snapshot.val().meta.timestamp < 86400) {
				continue;
			}
		}
		return id;
	}
}

export class Game {
	readonly id: number;
	readonly meta: { timestamp: number };
	readonly localPlayerName: string;

	private globalData: any;
	private players: { [id: string]: any };
	private localPlayerDataCache: any;

	private handlers: {
		playerJoined: ((name: string, initialData: any) => void)[];
		playerUpdated: ((name: string, data: any) => void)[];
		globalDataUpdated: ((data: any) => void)[];
		connectionChange: ((connected: boolean) => void)[];
	};
	private listeners: Unsubscribe[];

	constructor(
		id: number,
		{ meta, globalData, players }: { meta: { timestamp: number }; globalData: any; players: { [id: string]: any } },
		localPlayerName: string,
	) {
		this.id = id;
		this.meta = meta;
		this.globalData = globalData;
		this.players = players;

		this.localPlayerName = localPlayerName;
		this.localPlayerDataCache = players[this.localPlayerName];
		delete this.localPlayerDataCache._;

		this.handlers = {
			"playerJoined": [],
			"playerUpdated": [],
			"globalDataUpdated": [],
			"connectionChange": [],
		};
		this.listeners = [];

		this.listeners.push(onValue(ref(database, `${id}/globalData`), (snapshot) => {
			this.globalData = snapshot.val() || {};
			this.handlers["globalDataUpdated"].forEach((func) => {
				func(structuredClone(this.globalData));
			});
		}));

		this.listeners.push(onValue(ref(database, `${id}/players`), (snapshot) => {
			let pl = structuredClone(this.players);
			this.players = snapshot.val() || {};
			for (const [k, v] of Object.entries(this.players)) {
				let p = pl[k];
				if (p == undefined) {
					this.handlers["playerJoined"].forEach((func) => {
						func(k, structuredClone(v));
					});
				} else if (!isEqual(p, v)) {
					this.handlers["playerUpdated"].forEach((func) => {
						func(k, structuredClone(v));
					});
				}
			}
		}));

		this.listeners.push(onValue(ref(database, ".info/connected"), (snap) => {
			this.handlers["connectionChange"].forEach((func) => {
				func(snap.val());
			});
		}));
	}

	on(
		event: "playerJoined" | "playerUpdated" | "globalDataUpdated" | "connectionChange",
		func: (...args: any[]) => void,
	) {
		this.handlers[event].push(func);
	}

	leave() {
		this.listeners.forEach((listener) => {
			listener();
		});
	}

	getGlobalData() {
		return structuredClone(this.globalData);
	}

	updateGlobalData(data: any) {
		if (isEqual(this.globalData, data)) return;
		update(ref(database, `${this.id}/globalData`), data);
	}

	getAllPlayerData() {
		return structuredClone(this.players);
	}

	updatePlayerData(data: any) {
		if (isEqual(this.localPlayerDataCache, data)) return;
		update(ref(database, `${this.id}/players/${this.localPlayerName}`), data);
		this.localPlayerDataCache = structuredClone(data);
	}
}
