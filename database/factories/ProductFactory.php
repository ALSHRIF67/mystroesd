<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = \App\Models\Product::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'price' => $this->faker->numberBetween(10, 10000),
            'negotiable' => $this->faker->boolean(30),
            'category_id' => null,
            'subcategory_id' => null,
            // assign created product to currently authenticated user when available
            'user_id' => auth()->id() ?? \App\Models\User::factory(),
            'tags' => implode(',', $this->faker->words(3)),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->numerify('9########'),
            'country_code' => '+249',
            'image' => null,
            'images' => [],
        ];
    }
}
