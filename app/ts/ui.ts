/// <reference path="main.ts" />
/// <reference path="input/input.ts" />
/// <reference path="../../node_modules/@types/jquery/index.d.ts" />

namespace IslandIV {
	export namespace UI {
		export function Loading(): void {
			if ($("#loading").length) return;
			Overlay();
			$('<div id="loading" />').appendTo('body');
			$("#loading").addClass("centered");
			$("#loading").append('<div>Loading...</div>');
		}
		export function LoadingOff(): void {
			OverlayOff();
			$("#loading").remove();
		}

		export function Overlay(): void {
			if ($("#overlay").length) return;
			$('<div id="overlay"></div>').appendTo('body'); // style="display: none;"
		}
		export function OverlayOff(): void {
			$("#overlay").remove();
		}

		export function Game(): void {
			$('<div id="game" />').appendTo('body');

			// Map holder
			$('<div id="map-column" />').appendTo($("#game"));
			$("#map-column").append(View);

			// Right column
			$('<div id="right-column" />').appendTo($("#game"));
			$("#right-column").append('<div id="perma-text">:3</div>');
			$("#right-column").append('<hr>');
			$("#right-column").append('<div id="mode-text">:3</div>');
			$("#right-column").append('<hr>');
			$("#right-column").append('<div id="selected-text">:3</div>');
		}
		export function GameOff(): void {
			$("#game").remove();
		}

		export function PermaToRight(texts: string[]): void {
			$("#perma-text").empty();
			texts.forEach(text => $("#perma-text").append('<div>' + text + '</div>'));	
		}
		export function ModeToRight(texts: string[]): void {
			$("#mode-text").empty();
			texts.forEach(text => $("#mode-text").append('<div>' + text + '</div>'));	
		}

		export function TextsToRight(texts: string[]): void {
			$("#selected-text").empty();
			texts.forEach(text => $("#selected-text").append('<div>' + text + '</div>'));	
		}

		export function MessageWindow(title: string, text?: string): void {
			if ($("#message-window").length) return;
			PopupWindow("message-window", title, text);
		}

		export function QueryWindow(title: string, cb: () => void, text?: string) {
			if ($("#query-window").length) return;
			PopupWindow("query-window", title, text, "No");
			$('.button-row').prepend('<button id="okButton">Yes</button>');
			$('#okButton').click(() => {
				PopupWindowOff("query-window");
				cb();
			});
			$('#okButton').focus();
		}

		export function InputWindow(title: string, cb: (s: string) => void, text?: string) {
			if ($("#input-window").length) return;
			let buttoncb: () => void = () => {
				let given_name: string = $("#text_input").val();
				if (given_name && given_name.length > 0) cb(given_name);
			};

			PopupWindow("input-window", title, text, undefined, buttoncb);
			// TODO: Remove maxlength if needed
			$(".text-row").append('<div id="input_holder"><input id="text_input" type="text" placeholder="Enter text" maxlength="20"></div>');
			$("#text_input").focus();
			$("#text_input").on('keypress', e => { if(e.which === 13) { buttoncb(); PopupWindowOff("input-window"); } });
		}

		export function PopupWindow(id: string, title: string, text?: string, buttontext?: string, buttoncb?: () => void): void {
			Overlay();
			Input.WindowKeys();
			$('<div id="' + id + '"/>').appendTo('body');
			$('#' + id).addClass("centered").addClass("pop-up");
			$('#' + id).text(title);
			$('#' + id).append('<div class="text-row" />');
			if (text !== undefined) $('.text-row').append('<div style="color: grey">' + text + '</div>');
			$("#" + id).keyup(keyevent => { if(keyevent.keyCode == 27) PopupWindowOff(id); });
			$('#' + id).append('<div class="button-row"><button id="closeButton">' + (buttontext !== undefined ? buttontext : "Close") + '</button></div>');
			$('#closeButton').click(() => { if (buttoncb) buttoncb(); PopupWindowOff(id); });
			$('#closeButton').focus();	
		}
		export function PopupWindowOff(id: string): void {
			OverlayOff();
			Input.WindowKeysOff();
			$("#" + id).remove();
		}
		export function Download(data: any, filename: string): void {
			let json: string = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
			$('<a id="download" href="data:' + json + '" download="' + filename + '.json" /a>').appendTo('body');
			$('#download')[0].click(); //
			$("#download").remove();
		}

		/*
		$("#namegiving").append('<div style="text-align: center; color: grey">Give name to your character:</div>');
		$("#namegiving").append('<div id="input_holder" class= "selectable selected"><input id="name_input" type="text" placeholder="Ahto Simakuutio" maxlength="16"></div>');
		$("#name_input").focus(); */
	}
}