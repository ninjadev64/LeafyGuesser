<template>
  <div :class="$style['result-modal']">
    <div
      v-if="selectedMode === 'single'"
      :class="$style['result-modal__container']"
    >
      <span
        v-if="distance !== null"
        :class="$style['result-modal__text']"
        data-testid="single-result"
        v-html="resultText"
      />
      <button
        v-if="round < 5"
        :class="$style['result-modal__button']"
        data-testid="single-next-round-button"
        @click="$emit('onClickNextRoundButton')"
      >
        NEXT ROUND
      </button>
      <div
        v-else
        :class="$style['result-modal__button-group']"
      >
        <button
          v-if="isShowingSummary"
          :class="$style['result-modal__button']"
          data-testid="single-play-again-button"
          @click="$emit('onClickPlayAgainButton')"
        >
          PLAY AGAIN
        </button>
        <button
          :class="$style['result-modal__button']"
          data-testid="single-show-summary-button"
          @click="
            isShowingSummary
              ? $emit('onClickExitButton')
              : $emit('onClickViewSummaryButton')
          "
        >
          {{ exitButtonText }}
        </button>
      </div>
    </div>
    <div
      v-else
      :class="$style['result-modal__container']"
    >
      <span
        v-if="isShowingSummary"
        :class="$style['result-modal__text']"
        data-testid="multiplayer-summary"
        v-html="multiplayerSummaryText"
      />
      <span
        v-else
        :class="$style['result-modal__text']"
        data-testid="multiplayer-result"
        v-html="multiplayerResultText"
      />
      <button
        v-if="round < 5"
        :class="$style['result-modal__button']"
        :disabled="!isOwner && !isNextRoundReady"
        data-testid="multiplayer-next-round-button"
        @click="$emit('onClickNextRoundButton')"
      >
        NEXT ROUND
      </button>
      <button
        v-else
        :class="$style['result-modal__button']"
        data-testid="multiplayer-show-summary-button"
        @click="
          isShowingSummary
            ? $emit('endMultiplayerGame')
            : $emit('onClickViewSummaryButton')
        "
      >
        {{ exitButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Summary, DistanceByPlayer, ModeTypes } from "@/types";
import { calculateScore } from "@/utils";
import { PropType, computed } from "vue";

const props = defineProps({
  selectedMode: {
    type: String as PropType<ModeTypes>,
    required: true,
  },
  isOwner: {
    type: Boolean,
    required: true,
  },
  isShowingSummary: {
    type: Boolean,
    required: true,
  },
  isNextRoundReady: {
    type: Boolean,
    required: true,
  },
  distance: {
    type: Number,
    default: null,
  },
  distanceByPlayerArr: {
    type: Array as PropType<DistanceByPlayer[]>,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  multiplayerGameSummary: {
    type: Array as PropType<Summary[]>,
    required: true,
  },
});

const resultText = computed(() => {
  if (props.isShowingSummary) {
    return `You scored <strong>${props.score}</strong> points in total &#127881;`;
  } else {
    return `You are <strong>${props.distance}</strong>km away (+<strong>${calculateScore(props.distance)}</strong> points) &#128640;`;
  }
});

const multiplayerResultText = computed(() => {
  let text = "";

  for (let i = 0; i < props.distanceByPlayerArr.length; i++) {
    text += `<strong>${
      props.distanceByPlayerArr[i].playerName
    }</strong> is <strong>${
      props.distanceByPlayerArr[i].distance
    }</strong>km away (+<strong>${calculateScore(props.distanceByPlayerArr[i].distance)}</strong> points) ${i === 0 ? "&#127941;" : ""}<br>`;
  }

  return text;
});

const multiplayerSummaryText = computed(() => {
  let text = "";

  for (let i = 0; i < props.multiplayerGameSummary.length; i++) {
    text += `<strong>${
      props.multiplayerGameSummary[i].playerName
    }</strong> scored <strong>${
      props.multiplayerGameSummary[i].score
    }</strong> points in total${i === 0 ? "&#127941;" : ""}<br>`;
  }

  return text;
});

const exitButtonText = computed(() => {
  if (props.isShowingSummary) return "EXIT";
  else return "VIEW SUMMARY";
});

defineEmits<{
  onClickNextRoundButton: [];
  onClickViewSummaryButton: [];
  onClickPlayAgainButton: [];
  onClickExitButton: [];
  endMultiplayerGame: [];
}>();
</script>

<style module lang="scss">
.result-modal {
  @include page-padding;

  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 240px;
  padding-top: 24px;
  padding-bottom: 24px;
  background-color: white;
}

.result-modal__container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.result-modal__button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-modal__text {
  font-size: 16px;
  font-weight: 500;
  line-height: 2;
  color: var(--color-surface-primary);
}

.result-modal__button {
  @include flat-button;
}
</style>
