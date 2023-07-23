<script setup>
import { reactive, onMounted, computed } from 'vue'
import { helper_nFormatter, helper_numberToLocaleString } from './helpers/number-helpers'

import LoadingSpinner from './components/LoadingSpinner.vue'
import LoadingDataError from './components/LoadingDataError.vue'

/*
 * Main App State
 */

const dataStorage = reactive({
  items: [],
  exchangeRates: {},
  selectedCurrency: null,
  loadingDataError: false
})

/*
 * Computeds Depends on Main State
 */

const uniqCurrenciesList = computed(() =>
  [...new Set(dataStorage.items.map((item) => item.currency))].sort()
)

const totalCost = computed(() =>
  dataStorage.items
    .filter((item) => item.selected)
    .map((item) => convertItemPriceToSelectedCurrency(item))
    .reduce((acc, item) => acc + item, 0)
)

const howManyItemsSelected = computed(
  () => dataStorage.items.filter((item) => item.selected).length
)

const isAllItemsSelected = computed(() => howManyItemsSelected.value === dataStorage.items.length)

/*
 * Helper Methods for State
 */

const convertItemPriceToSelectedCurrency = (item) =>
  (dataStorage.exchangeRates[`${item.currency}-${dataStorage.selectedCurrency}`] ?? 1) * item.price

const selectAllItems = () => dataStorage.items.forEach((item) => (item.selected = true))

/*
 * Data Loading and Putting in State
 */

onMounted(async () => {
  try {
    let response = await fetch(import.meta.env.VITE_API_URL)
    response = await response.json()

    setTimeout(() => {
      /* Long data loading imitation */

      if (Array.isArray(response.data) && response['currencies-pairs']) {
        dataStorage.items.push(...response.data.map((item) => ({ selected: false, ...item })))
        dataStorage.exchangeRates = response['currencies-pairs']
      } else {
        dataStorage.loadingDataError = true
      }
    }, 1000)
  } catch (error) {
    dataStorage.loadingDataError = true
  }
})
</script>

<template>
  <LoadingSpinner v-if="!dataStorage.items.length && !dataStorage.loadingDataError" />

  <LoadingDataError v-if="dataStorage.loadingDataError" />

  <Transition>
    <div v-if="dataStorage.items.length" class="container mx-auto py-3 px-3">
      <h1 class="text-2xl font-semibold mb-4">Crypto Price App</h1>

      <ol class="relative border-l border-gray-200">
        <li class="mb-7 ml-4">
          <div
            class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"
          ></div>
          <time class="mb-1 text-sm font-normal leading-none text-gray-400">Step 1</time>
          <h3 class="text-lg font-semibold text-gray-900">
            Select <span class="underline">one or more</span> items in list
          </h3>
          <p class="mb-2 text-base font-normal text-gray-500">
            For now we have {{ dataStorage.items.length }} items in stock.
          </p>

          <ul class="max-w-md space-y-1 text-gray-500 list-inside">
            <li
              class="flex flex-wrap gap-1 items-center cursor-pointer py-2 border-b-[1px] last:border-b-0 select-none text-md"
              :key="item.id"
              v-for="item in dataStorage.items"
              @click="item.selected = !item.selected"
            >
              <svg
                v-if="item.selected"
                class="w-3.5 h-3.5 mr-2 text-green-500 flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
                />
              </svg>
              <svg
                v-else
                class="w-3.5 h-3.5 mr-2 text-gray-500 flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
                />
              </svg>
              <span class="mr-1 text-gray-400" :class="{ 'text-gray-800': item.selected }">
                Item #{{ item.id }}
              </span>

              <span
                class="bg-green-100 text-green-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded"
                :class="{ 'bg-green-200': item.selected }"
              >
                {{ helper_numberToLocaleString(item.price) }}
              </span>
              <span
                class="bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded"
                :class="{ 'bg-blue-200': item.selected }"
              >
                {{ item.currency }}
              </span>
              <span
                v-if="
                  dataStorage.selectedCurrency && dataStorage.selectedCurrency !== item.currency
                "
                class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded"
                :class="{ 'bg-yellow-200': item.selected }"
              >
                ~ {{ helper_nFormatter(convertItemPriceToSelectedCurrency(item)) }} in
                {{ dataStorage.selectedCurrency }}
              </span>
            </li>
          </ul>

          <button
            type="button"
            @click="selectAllItems"
            :disabled="isAllItemsSelected"
            class="mt-2 text-gray-900 bg-white border border-gray-300 focus:outline-none enabled:hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 disabled:opacity-25"
          >
            Select All
          </button>
        </li>
        <li class="mb-7 ml-4">
          <div
            class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"
          ></div>
          <time class="mb-1 text-sm font-normal leading-none text-gray-400">Step 2</time>
          <h3 class="text-lg font-semibold text-gray-900">
            <span class="underline">Choose currency</span> you desired
          </h3>
          <p class="text-base font-normal text-gray-500 mb-4">
            For now we have {{ uniqCurrenciesList.length }} options.
          </p>

          <button
            :key="item"
            v-for="item in uniqCurrenciesList"
            :disabled="dataStorage.selectedCurrency === item"
            type="button"
            @click="dataStorage.selectedCurrency = item"
            class="text-gray-800 hover:text-white border border-gray-600 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
            :class="{ 'bg-gray-800 text-white': dataStorage.selectedCurrency === item }"
          >
            {{ item }}
          </button>
        </li>
        <Transition>
          <li class="ml-4" v-if="howManyItemsSelected > 0 && dataStorage.selectedCurrency">
            <div
              class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white"
            ></div>
            <time class="mb-1 text-sm font-normal leading-none text-gray-400">Step 3</time>
            <h3 class="text-lg font-semibold text-gray-900">
              The <span class="underline">total cost</span> is
              <span
                class="text-xl bg-green-100 text-green-800 text-lg font-medium px-2 py-0.5 mr-2 rounded border border-green-400"
              >
                {{ helper_numberToLocaleString(totalCost) }}
              </span>
              <span
                class="text-xl bg-blue-100 text-blue-800 text-lg font-medium px-2 py-0.5 rounded border border-blue-400"
              >
                {{ dataStorage.selectedCurrency }}
              </span>
            </h3>
            <p class="text-base font-normal text-gray-500">
              Items selected: {{ howManyItemsSelected }}, prices converted to
              {{ dataStorage.selectedCurrency }}
            </p>
          </li>
        </Transition>
      </ol>
    </div>
  </Transition>
</template>

<style scoped></style>
