<template>
  <div class="flex min-h-screen" style="background-color: #121212; color: #f3f4f6;">
    <!-- Sidebar -->
    <aside class="w-64 fixed h-full flex flex-col" style="background-color: #0a0a0a; border-right: 1px solid #1f1f1f;">
      <div class="p-6">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-10">
          <div class="p-2 rounded-lg" style="background-color: #f97316;">
            <span class="material-symbols-outlined text-white text-2xl">dashboard_customize</span>
          </div>
          <div>
            <h1 class="text-lg font-extrabold tracking-tight">Central Admin</h1>
            <p class="text-[10px] uppercase tracking-widest font-bold" style="color: #f97316;">Restaurant SaaS</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="space-y-2">
          <a class="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-semibold transition-all" href="#" style="background-color: #1f1f1f;">
            <span class="material-symbols-outlined" style="color: #f97316;">analytics</span>
            Ventas
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" href="#" style="color: #9ca3af;" @mouseenter="$event.target.parentElement.style.backgroundColor='#1f1f1f'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
            <span class="material-symbols-outlined">table_restaurant</span>
            Mesas
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" href="#" style="color: #9ca3af;" @mouseenter="$event.target.parentElement.style.backgroundColor='#1f1f1f'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
            <span class="material-symbols-outlined">outdoor_grill</span>
            Cocina
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" href="#" style="color: #9ca3af;" @mouseenter="$event.target.parentElement.style.backgroundColor='#1f1f1f'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
            <span class="material-symbols-outlined">badge</span>
            Personal
          </a>
        </nav>
      </div>

      <!-- User Profile -->
      <div class="mt-auto p-6" style="border-top: 1px solid #1f1f1f;">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style="background-color: #1f1f1f;">
            <img alt="Admin Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvCyhzFtsLexitreddCE_NsADXBzAUPlvGYmGnGcDM_S_7JAvOHA8LcZi3SgvJyekTuq6sHYwJ_5gUJ2nD6pVdU2p3i6qQ-bR9eL4hwpmJrzn3WwNUMNc10CZnp0aAFJLbdP5teAEpnMTCNXuwSq8UG1893YmWJm_vqHbZ0aumBJUtKJ1nfEEkdvfRKb5eZrJ8r88Yo0PtdW5SrGm_o5xpI4NSyLSh01-pyGV0JwmuXUjBgK8H-HEm8bP__3rY4UcgOFkhNgX2-3c7"/>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold">Roberto G.</p>
            <p class="text-xs" style="color: #6b7280;">Gerente</p>
          </div>
          <button class="text-gray-500 hover:text-white" style="color: #6b7280;">
            <span class="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64 p-8">
      <!-- Header -->
      <header class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-3xl font-extrabold tracking-tight">Panel de Control</h2>
          <p style="color: #9ca3af;">Resumen de actividad en tiempo real</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center px-4 py-2 rounded-xl border" style="background-color: #1f1f1f; border-color: #2d2d2d;">
            <span class="material-symbols-outlined mr-2 text-xl" style="color: #9ca3af;">calendar_today</span>
            <span class="text-sm font-semibold">Hoy, 24 May</span>
          </div>
          <button class="text-white p-2.5 rounded-xl transition-all" style="background-color: #f97316; box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);">
            <span class="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Sales Card -->
        <div class="p-6 rounded-2xl relative overflow-hidden group" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-xl" style="background-color: rgba(249, 115, 22, 0.1);">
              <span class="material-symbols-outlined" style="color: #f97316;">payments</span>
            </div>
            <span class="text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1" style="background-color: rgba(34, 197, 94, 0.1); color: #22c55e;">
              <span class="material-symbols-outlined text-sm">trending_up</span> +12.5%
            </span>
          </div>
          <p class="text-sm font-medium" style="color: #9ca3af;">Ventas Totales</p>
          <h3 class="text-2xl font-extrabold mt-1">2.450,80€</h3>
          <div class="mt-4 h-16 w-full flex items-end gap-1">
            <div class="flex-1 rounded-t h-[40%]" style="background-color: rgba(249, 115, 22, 0.2);"></div>
            <div class="flex-1 rounded-t h-[60%]" style="background-color: rgba(249, 115, 22, 0.2);"></div>
            <div class="flex-1 rounded-t h-[45%]" style="background-color: rgba(249, 115, 22, 0.2);"></div>
            <div class="flex-1 rounded-t h-[80%]" style="background-color: rgba(249, 115, 22, 0.2);"></div>
            <div class="flex-1 rounded-t h-[95%]" style="background-color: #f97316;"></div>
          </div>
        </div>

        <!-- Active Orders Card -->
        <div class="p-6 rounded-2xl relative overflow-hidden group" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-xl" style="background-color: rgba(34, 197, 94, 0.1);">
              <span class="material-symbols-outlined" style="color: #22c55e;">receipt_long</span>
            </div>
            <span class="text-xs font-bold px-2 py-1 rounded-lg" style="background-color: #1f1f1f; color: #9ca3af;">En curso</span>
          </div>
          <p class="text-sm font-medium" style="color: #9ca3af;">Pedidos Activos</p>
          <h3 class="text-2xl font-extrabold mt-1">18</h3>
          <div class="mt-4 h-16 w-full flex items-end gap-1">
            <div class="flex-1 rounded-t h-[30%]" style="background-color: rgba(34, 197, 94, 0.2);"></div>
            <div class="flex-1 rounded-t h-[50%]" style="background-color: rgba(34, 197, 94, 0.2);"></div>
            <div class="flex-1 rounded-t h-[70%]" style="background-color: rgba(34, 197, 94, 0.2);"></div>
            <div class="flex-1 rounded-t h-[60%]" style="background-color: rgba(34, 197, 94, 0.2);"></div>
            <div class="flex-1 rounded-t h-[85%]" style="background-color: #22c55e;"></div>
          </div>
        </div>

        <!-- Table Occupancy Card -->
        <div class="p-6 rounded-2xl" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-xl" style="background-color: rgba(59, 130, 246, 0.1);">
              <span class="material-symbols-outlined" style="color: #3b82f6;">deck</span>
            </div>
          </div>
          <p class="text-sm font-medium" style="color: #9ca3af;">Ocupación Mesas</p>
          <div class="flex items-end justify-between mt-1">
            <h3 class="text-2xl font-extrabold">85%</h3>
            <p class="text-xs pb-1" style="color: #6b7280;">22 de 26 mesas</p>
          </div>
          <div class="w-full h-2.5 rounded-full mt-6 overflow-hidden" style="background-color: #1f1f1f;">
            <div class="h-full w-[85%] rounded-full" style="background-color: #3b82f6;"></div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Orders Table -->
        <div class="lg:col-span-2 rounded-2xl overflow-hidden" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
          <div class="p-6 flex justify-between items-center" style="border-bottom: 1px solid #1f1f1f;">
            <h4 class="font-bold text-lg">Pedidos Recientes</h4>
            <button class="text-sm font-bold hover:underline" style="color: #f97316;">Ver todos</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-xs uppercase tracking-wider" style="color: #6b7280; border-bottom: 1px solid #1f1f1f;">
                  <th class="px-6 py-4 font-semibold">Pedido</th>
                  <th class="px-6 py-4 font-semibold">Mesa</th>
                  <th class="px-6 py-4 font-semibold">Estado</th>
                  <th class="px-6 py-4 font-semibold">Total</th>
                  <th class="px-6 py-4 font-semibold">Tiempo</th>
                </tr>
              </thead>
              <tbody style="border-color: #1f1f1f;">
                <tr class="transition-colors" style="border-bottom: 1px solid #1f1f1f;" @mouseenter="$event.target.parentElement.style.backgroundColor='rgba(31, 31, 31, 0.5)'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
                  <td class="px-6 py-4 font-medium">#1294</td>
                  <td class="px-6 py-4">Mesa 04</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: rgba(249, 115, 22, 0.1); color: #f97316;">
                      Preparing
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold">42,50€</td>
                  <td class="px-6 py-4 text-sm" style="color: #9ca3af;">12 min</td>
                </tr>
                <tr class="transition-colors" style="border-bottom: 1px solid #1f1f1f;" @mouseenter="$event.target.parentElement.style.backgroundColor='rgba(31, 31, 31, 0.5)'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
                  <td class="px-6 py-4 font-medium">#1293</td>
                  <td class="px-6 py-4">Mesa 12</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: rgba(34, 197, 94, 0.1); color: #22c55e;">
                      Ready
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold">28,00€</td>
                  <td class="px-6 py-4 text-sm" style="color: #9ca3af;">25 min</td>
                </tr>
                <tr class="transition-colors" style="border-bottom: 1px solid #1f1f1f;" @mouseenter="$event.target.parentElement.style.backgroundColor='rgba(31, 31, 31, 0.5)'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
                  <td class="px-6 py-4 font-medium">#1292</td>
                  <td class="px-6 py-4">Mesa 08</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: #374151; color: #d1d5db;">
                      Delivered
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold">115,20€</td>
                  <td class="px-6 py-4 text-sm" style="color: #9ca3af;">42 min</td>
                </tr>
                <tr class="transition-colors" @mouseenter="$event.target.parentElement.style.backgroundColor='rgba(31, 31, 31, 0.5)'" @mouseleave="$event.target.parentElement.style.backgroundColor='transparent'">
                  <td class="px-6 py-4 font-medium">#1291</td>
                  <td class="px-6 py-4">Mesa 01</td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide" style="background-color: rgba(249, 115, 22, 0.1); color: #f97316;">
                      Preparing
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold">18,50€</td>
                  <td class="px-6 py-4 text-sm" style="color: #9ca3af;">5 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sidebar: Active Staff & Kitchen Performance -->
        <div class="rounded-2xl p-6" style="background-color: #0a0a0a; border: 1px solid #1f1f1f;">
          <h4 class="font-bold text-lg mb-6">Personal Activo</h4>
          <div class="space-y-4">
            <!-- Staff Member 1 -->
            <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: rgba(31, 31, 31, 0.3);">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: rgba(249, 115, 22, 0.2); color: #f97316;">MA</div>
                <div>
                  <p class="text-sm font-bold">Marco A.</p>
                  <p class="text-[10px]" style="color: #6b7280;">Cocinero</p>
                </div>
              </div>
              <div class="w-2 h-2 rounded-full" style="background-color: #22c55e;"></div>
            </div>

            <!-- Staff Member 2 -->
            <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: rgba(31, 31, 31, 0.3);">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: rgba(59, 130, 246, 0.2); color: #3b82f6;">SV</div>
                <div>
                  <p class="text-sm font-bold">Sara V.</p>
                  <p class="text-[10px]" style="color: #6b7280;">Camarera</p>
                </div>
              </div>
              <div class="w-2 h-2 rounded-full" style="background-color: #22c55e;"></div>
            </div>

            <!-- Staff Member 3 -->
            <div class="flex items-center justify-between p-3 rounded-xl" style="background-color: rgba(31, 31, 31, 0.3);">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: rgba(107, 114, 128, 0.2); color: #9ca3af;">JL</div>
                <div>
                  <p class="text-sm font-bold">Juan L.</p>
                  <p class="text-[10px]" style="color: #6b7280;">Camarero</p>
                </div>
              </div>
              <div class="w-2 h-2 rounded-full" style="background-color: #4b5563;"></div>
            </div>
          </div>

          <!-- Kitchen Performance -->
          <div class="mt-8">
            <h5 class="text-xs font-bold uppercase tracking-widest mb-4" style="color: #6b7280;">Rendimiento Cocina</h5>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span>Eficiencia</span>
                  <span class="font-bold" style="color: #f97316;">92%</span>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" style="background-color: #1f1f1f;">
                  <div class="h-full w-[92%]" style="background-color: #f97316;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
