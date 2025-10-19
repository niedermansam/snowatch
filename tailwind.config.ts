import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "@/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			'sw-indigo-900': '#19216C',
  			'sw-indigo-800': '#2D3A8C',
  			'sw-indigo-700': '#35469C',
  			'sw-indigo-600': '#4055A8',
  			'sw-indigo-500': '#4B63B4',
  			'sw-indigo-400': '#647ACB',
  			'sw-indigo-300': '#7B93DB',
  			'sw-indigo-200': '#98AEEB',
  			'sw-indigo-100': '#BED0F7',
  			'sw-indigo-50': '#E0E8F9',
  			'sw-gray-900': '#1F2933',
  			'sw-gray-800': '#323F4B',
  			'sw-gray-700': '#3E4C59',
  			'sw-gray-600': '#52606D',
  			'sw-gray-500': '#616E7C',
  			'sw-gray-400': '#7B8794',
  			'sw-gray-300': '#9AA5B1',
  			'sw-gray-200': '#CBD2D9',
  			'sw-gray-100': '#E4E7EB',
  			'sw-gray-50': '#F5F7FA',
  			'sw-blue-900': '#035388',
  			'sw-blue-800': '#0B69A3',
  			'sw-blue-700': '#127FBF',
  			'sw-blue-600': '#1992D4',
  			'sw-blue-500': '#2BB0ED',
  			'sw-blue-400': '#40C3F7',
  			'sw-blue-300': '#5ED0FA',
  			'sw-blue-200': '#81DEFD',
  			'sw-blue-100': '#B3ECFF',
  			'sw-blue-50': '#E3F8FF',
  			'sw-red-900': '#610316',
  			'sw-red-800': '#8A041A',
  			'sw-red-700': '#AB091E',
  			'sw-red-600': '#CF1124',
  			'sw-red-500': '#E12D39',
  			'sw-red-400': '#EF4E4E',
  			'sw-red-300': '#F86A6A',
  			'sw-red-200': '#FF9B9B',
  			'sw-red-100': '#FFBDBD',
  			'sw-red-50': '#FFE3E3',
  			'sw-yellow-900': '#8D2B0B',
  			'sw-yellow-800': '#B44D12',
  			'sw-yellow-700': '#CB6E17',
  			'sw-yellow-600': '#DE911D',
  			'sw-yellow-500': '#F0B429',
  			'sw-yellow-400': '#F7C948',
  			'sw-yellow-300': '#FADB5F',
  			'sw-yellow-200': '#FCE588',
  			'sw-yellow-100': '#FFF3C4',
  			'sw-yellow-50': '#FFFBEA',
  			'sw-teal-900': '#014D40',
  			'sw-teal-800': '#0C6B58',
  			'sw-teal-700': '#147D64',
  			'sw-teal-600': '#199473',
  			'sw-teal-500': '#27AB83',
  			'sw-teal-400': '#3EBD93',
  			'sw-teal-300': '#65D6AD',
  			'sw-teal-200': '#8EEDC7',
  			'sw-teal-100': '#C6F7E2',
  			'sw-teal-50': '#F0FCF9',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
			'spin-slow': {
				from: {
					transform: 'rotate(0deg)'
				},
				to: {
					transform: 'rotate(360deg)'
				}
			}	
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
			'spin-slow': 'spin-slow 10s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config