<template>
  <div class="w-full bg-white dark:bg-[#2a1e19] transition-colors duration-300">
    <!-- Page Heading -->
    <div class="mx-auto max-w-[1200px] px-4 md:px-10 py-12">
      <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="max-w-2xl">
          <span class="text-[#e27246] font-bold uppercase tracking-widest text-xs">Curated Selection</span>
          <h2 class="mt-2 text-5xl font-black leading-tight tracking-tighter md:text-6xl text-[#1a120e] dark:text-[#fbf9f8]">
            Chef's Specials
          </h2>
          <p class="mt-4 text-lg text-[#946451] dark:text-[#b08e7f] leading-relaxed">
            Hand-crafted masterpieces from our head chef's kitchen, using only seasonal ingredients sourced from local artisans.
          </p>
        </div>
        <button class="flex items-center gap-2 rounded-full border-2 border-[#1a120e] dark:border-[#fbf9f8] px-6 py-3 font-bold text-[#1a120e] dark:text-[#fbf9f8] hover:bg-[#1a120e] hover:text-white dark:hover:bg-[#fbf9f8] dark:hover:text-[#1a120e] transition-all">
          <span>Explore Full Menu</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <!-- Hero Specials Carousel -->
      <section class="mb-16">
        <div class="hide-scrollbar flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6">
          <!-- Hero Card 1 -->
          <div class="group relative min-w-[320px] md:min-w-[600px] aspect-[16/10] md:aspect-[21/10] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-[#201612]">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-h1UhfwblNo6LdXt9SIWceLxiDr10j9FgAm4ZyqfOiMEGlq2ojMEG94XbBzsajSRqEhMe9xHozzXQvIisZlC2EJkKN02j9zga6iwT8tr4pC_VFUCfU50kfnkKzgc-lT9GWynNWKWATrJ_qJzGY0qVO5xNoaOkT69RgTvgJ3BUZtqYaluTzCCFmp4FVjaCCiFtUyK9ysl_xH4eU9PGcKq4O-ETzemjClUlaicMsXaFDn9rgfmX_qn2FBrq9QkBi6zOt-PwwfnDxgb7');"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="absolute top-6 left-6 glass-label px-4 py-1.5 rounded-full flex items-center gap-2">
              <span class="material-symbols-outlined text-[#e27246] text-sm font-bold">star</span>
              <span class="text-xs font-bold text-white uppercase tracking-wider">Chef's Pick</span>
            </div>
            <div class="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div class="max-w-md">
                <h3 class="text-3xl font-bold text-white">Signature Truffle Pizza</h3>
                <p class="mt-2 text-white/80 text-sm line-clamp-2">Wild seasonal mushrooms, freshly shaved black truffles, fior di latte, and a drizzle of organic honey.</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-2xl font-black text-white">$28</span>
                <button class="flex items-center justify-center rounded-lg bg-[#e27246] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#e27246]/90 transition-all active:scale-95">
                  Add to Order
                </button>
              </div>
            </div>
          </div>

          <!-- Hero Card 2 -->
          <div class="group relative min-w-[320px] md:min-w-[600px] aspect-[16/10] md:aspect-[21/10] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-[#201612]">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBxdpaCrCQgDAt8aKinVCjn7r4lYoMz5_--whsmReBy1W2_ik7Seo4t2yCmpjdCISz6-n4l8ucTP9VMVzfJkT-Y2dSF_JS25bw5_ujJI-q9RVqEbxzim-iezg7vyAjECdXW3q49BDl_RH40QQoERwPNamW0NkeUSQ5yxry2d1p3VhnxVSDxdUa6bw7xdGM6jQLkA_IXbmDCIZw_npI-X6_3HwjnYhjwb5Nm0BG-0qbT3xH22XSt8u-yN26VNNvN7');"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div class="absolute top-6 left-6 glass-label px-4 py-1.5 rounded-full flex items-center gap-2">
              <span class="material-symbols-outlined text-[#477051] text-sm font-bold">timer</span>
              <span class="text-xs font-bold text-white uppercase tracking-wider">Limited Availability</span>
            </div>
            <div class="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div class="max-w-md">
                <h3 class="text-3xl font-bold text-white">Aged Ribeye with Bone Marrow</h3>
                <p class="mt-2 text-white/80 text-sm line-clamp-2">45-day dry-aged cuts, served with sea salt flakes, roasted bone marrow, and red wine reduction.</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-2xl font-black text-white">$45</span>
                <button class="flex items-center justify-center rounded-lg bg-[#e27246] px-6 py-3 font-bold text-white shadow-lg hover:bg-[#e27246]/90 transition-all active:scale-95">
                  Add to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trending Now Section -->
      <section>
        <div class="mb-8 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-8 w-1.5 bg-[#477051] rounded-full"></div>
            <h2 class="text-2xl font-black tracking-tight uppercase text-[#1a120e] dark:text-[#fbf9f8]">
              Trending Now
            </h2>
          </div>
          <div class="flex gap-2">
            <button class="p-2 rounded-full border border-[#f2ebe8] dark:border-[#3a2d27] hover:bg-white dark:hover:bg-[#322520] transition-colors shadow-sm">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button class="p-2 rounded-full border border-[#f2ebe8] dark:border-[#3a2d27] hover:bg-white dark:hover:bg-[#322520] transition-colors shadow-sm text-[#e27246]">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Trending Card 1 -->
          <div class="group flex flex-col bg-white dark:bg-[#2a1e19] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div class="relative h-48 overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAdaQcQ1zRW-wOU1_iBMER2BHvLJEEJN38PYN2blchdI0xqvKgsJrJkGtVlTe9RZOUYQlpBD45u7Uk4aa9VBsLiqKyWXBtHY3qBWuU-Hyg-M2VlIzWFrCoIgq8VuUGbFZuEZ52dUXk-HtehZmiWFTub3Xkg63ULE5crWlcxiQGOtnJcR43U2c01sx6GktSzuUMHWMGeNLRFmSTdKZZHO09Zandm26L6-6_-31IXsIpGJtyO3bSVjPFY6KZXypduri0QKbd_lysiRfO');"></div>
              <div class="absolute top-3 right-3 bg-[#477051] text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">80+ Orders Today</div>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg leading-tight group-hover:text-[#e27246] transition-colors text-[#1a120e] dark:text-[#fbf9f8]">Spicy Vodka Pasta</h4>
                <span class="font-black text-[#e27246]">$22</span>
              </div>
              <p class="text-sm text-[#946451] dark:text-[#b08e7f] line-clamp-2 mb-4">Handmade rigatoni, silky tomato cream, Calabrian chili, and aged parmesan.</p>
              <div class="mt-auto flex items-center justify-between pt-2">
                <div class="flex items-center gap-1 text-[#477051]">
                  <span class="material-symbols-outlined text-sm">local_fire_department</span>
                  <span class="text-[11px] font-bold uppercase">Popular Choice</span>
                </div>
                <button class="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f2ebe8] dark:bg-[#3a2d27] hover:bg-[#e27246] hover:text-white transition-all">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Trending Card 2 -->
          <div class="group flex flex-col bg-white dark:bg-[#2a1e19] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div class="relative h-48 overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDO1vm4lRjVWEcsYksFiF839PlINBRpJSQYR_cA4rPTJasdduYTyHNxXLVnYl2mQ2hOAwMurOE3fdTtL7M7W1Igtxo07AgvFiUZWemZ7r80q4BBrSwRPdSg5MQulPzXe_1FeeDUTZ9v0yfRR5VibV0iynbnRBXSb1LfoEvnBSUu2izVEAKyzD9wTDMKYEYnzcxCmFX5vlmfPrn_Ct-EIap9ntEHNi3UN8EPD_6e38DHIHGupUn29BxURe-RmMEBKBA8PcpqngQE1PtF');"></div>
              <div class="absolute top-3 right-3 bg-[#e27246] text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">Best Seller</div>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg leading-tight group-hover:text-[#e27246] transition-colors text-[#1a120e] dark:text-[#fbf9f8]">Crispy Brussels Sprouts</h4>
                <span class="font-black text-[#e27246]">$14</span>
              </div>
              <p class="text-sm text-[#946451] dark:text-[#b08e7f] line-clamp-2 mb-4">Honey balsamic glaze, toasted walnuts, and crispy pancetta bits.</p>
              <div class="mt-auto flex items-center justify-between pt-2">
                <div class="flex items-center gap-1 text-[#477051]">
                  <span class="material-symbols-outlined text-sm">groups</span>
                  <span class="text-[11px] font-bold uppercase">Crowd Favorite</span>
                </div>
                <button class="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f2ebe8] dark:bg-[#3a2d27] hover:bg-[#e27246] hover:text-white transition-all">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Trending Card 3 -->
          <div class="group flex flex-col bg-white dark:bg-[#2a1e19] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div class="relative h-48 overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOZaIQOHuivjrclE57ifRcx7oFvQa_5EL6DF4fMAp3SqY0xsZvlIaBZbM5mtBEkxTAZVXkLRG4boBIny5JD1vZFwmF5LRCC0dWOD-XY-SUGB-rSuPdu4V6pr0ru5A4GCLZS9t8zO1cyDO1o4yzzpp6WGIr4IrUSE-x0-OYRPu19KVau1--jmVXfV3jvTxPGXBa3AaZstgYNrlH1Y9dEcd1X38VfpHi7kZePA4V33HL8C1w6zMCjWiABvzgthDiwebsjpBSDD3wUSsL');"></div>
              <div class="absolute top-3 right-3 bg-[#477051] text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">Fresh Daily</div>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg leading-tight group-hover:text-[#e27246] transition-colors text-[#1a120e] dark:text-[#fbf9f8]">Burrata &amp; Tomato</h4>
                <span class="font-black text-[#e27246]">$18</span>
              </div>
              <p class="text-sm text-[#946451] dark:text-[#b08e7f] line-clamp-2 mb-4">Creamy burrata heart, heirloom tomato medley, cold-pressed basil oil.</p>
              <div class="mt-auto flex items-center justify-between pt-2">
                <div class="flex items-center gap-1 text-[#477051]">
                  <span class="material-symbols-outlined text-sm">eco</span>
                  <span class="text-[11px] font-bold uppercase">Freshly Picked</span>
                </div>
                <button class="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f2ebe8] dark:bg-[#3a2d27] hover:bg-[#e27246] hover:text-white transition-all">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Trending Card 4 -->
          <div class="group flex flex-col bg-white dark:bg-[#2a1e19] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
            <div class="relative h-48 overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCG4qKsFazIKDsQ8MBCip5-LzOl5L4e0e70-fWhHH-_WQnXbSp4W5aKqqKJo7AHuJRuhXODF8J8om5Dc0Y8xYNXVLZYzljbTY-Fyev8F-de7S_lnolbOyVyDDtsj4qw0JWnYscSz3lwinkVAa-V1V7TOszX3oEGoCOuV8Ke0jR_eSP46_VYgtHymvGrbAjxtr06Ld1jM4jgD7JxJCFJVHaZLrvf7C3Hup0l5NUs608lHW-swPJgxgQVqEbf_dLXkSQq4VDLy65j5y-a');"></div>
              <div class="absolute top-3 right-3 bg-[#e27246] text-white text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">98% Rating</div>
            </div>
            <div class="p-5 flex flex-col flex-1">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-bold text-lg leading-tight group-hover:text-[#e27246] transition-colors text-[#1a120e] dark:text-[#fbf9f8]">Tuna Tartare</h4>
                <span class="font-black text-[#e27246]">$24</span>
              </div>
              <p class="text-sm text-[#946451] dark:text-[#b08e7f] line-clamp-2 mb-4">Ahi tuna, avocado mousse, citrus ponzu, and toasted sesame crackers.</p>
              <div class="mt-auto flex items-center justify-between pt-2">
                <div class="flex items-center gap-1 text-[#477051]">
                  <span class="material-symbols-outlined text-sm">thumb_up</span>
                  <span class="text-[11px] font-bold uppercase">Top Rated</span>
                </div>
                <button class="h-10 w-10 flex items-center justify-center rounded-lg bg-[#f2ebe8] dark:bg-[#3a2d27] hover:bg-[#e27246] hover:text-white transition-all">
                  <span class="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.glass-label {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.dark .glass-label {
  background: rgba(32, 22, 18, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
