import React, { useEffect, useState } from "react";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { useNavigate } from "react-router-dom";

const UserRecipeManager = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([{ instruction: "", time: "" }]);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", optional: false },
  ]);

  const suggestedTags = [
    "spicy",
    "quick",
    "healthy",
    "vegan",
    "indian",
    "italian",
    "low-calorie",
    "fast-food",
    "lunch",
    "break-fast",
    "dinner",
  ];

  const filteredSuggestions = suggestedTags.filter(
    (tag) => tag.includes(tagInput.toLowerCase()) && !tags.includes(tag)
  );

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: "", optional: false },
    ]);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addTag = (value) => {
    if (!value || tags.includes(value)) return;
    setTags([...tags, value]);
    setTagInput("");
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!filteredSuggestions.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(tagInput.trim());
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          addTag(filteredSuggestions[activeIndex]);
        } else {
          addTag(tagInput.trim());
        }
        break;

      case "Escape":
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addStep = () => {
    setSteps([...steps, { instruction: "", time: "" }]);
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    preview: "",
    cuisine: "",
    calories: "",
    costEstimate: "",
    dietType: "Any",
    difficulty: "Beginner",
    cookingTime: "",
    tags: "",
  });

  /* ---------------- FETCH USER RECIPES ---------------- */
  const fetchRecipes = async () => {
    try {
      const res = await axios.get(`${base_url}/recipes`, {
        withCredentials: true
      });
      console.log("Get user recipe", res.data);
      setRecipes(res.data.data.data);
    } catch (err) {
      console.error("Error in fetch recipe", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      cuisine: "",
      calories: "",
      costEstimate: "",
      dietType: "Any",
      difficulty: "Beginner",
      cookingTime: "",
    });
    setIngredients([{ name: "", quantity: "", optional: false }]);
    setSteps([{ instruction: "", time: "" }]);
    setImage(null);
    setPreview(null);
    setTags([]);
    setEditingRecipe(null);
    setOpen(false);
  };

  /* ---------------- ADD / UPDATE ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    if (!form.title || !form.cookingTime) {
      alert("Title and cooking time are required");
      return;
    }
    formData.append("title", form.title);
    formData.append("description", form.description);

    if (image) {
      formData.append("image", image);
    }

    formData.append(
      "metadata",
      JSON.stringify({
        calories: form.calories,
        costEstimate: form.costEstimate,
        cuisine: form.cuisine,
        dietType: form.dietType,
        difficulty: form.difficulty,
        cookingTime: Number(form.cookingTime),
      })
    );

    const formattedSteps = steps.map((step, index) => ({
      stepNumber: index + 1,
      instruction: step.instruction,
      time: Number(step.time),
    }));
    formData.append("steps", JSON.stringify(formattedSteps));
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("tags", JSON.stringify(tags));

    try {
      if (editingRecipe) {
        // ✅ UPDATE RECIPE
        const res = await axios.patch(
          `${base_url}/recipes/re/update/${editingRecipe._id}`,
          formData,
          {
            withCredentials: true
          }
        );
        console.log("updated recipe", res.data);
      } else {
        // ✅ CREATE RECIPE
        const res = await axios.post(`${base_url}/recipes/create`, formData, {
          withCredentials: true
        });
        console.log("added recipe", res.data);
      }
      setIsLoading(false);
      // setOpen(false);
      resetForm();
      fetchRecipes();
    } catch (err) {
      console.error(err.response?.data || err);
      setIsLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setOpen(true);

    setForm({
      title: recipe.title || "",
      description: recipe.description || "",
      cuisine: recipe.metadata?.cuisine || "",
      dietType: recipe.metadata?.dietType || "Any",
      cookingTime: recipe.metadata?.cookingTime || "",
      calories: recipe.metadata?.calories || "",
      costEstimate: recipe.metadata?.costEstimate || "",
      difficulty: recipe.metadata?.difficulty || "",
    });

    setIngredients(
      recipe.ingredients?.length
        ? recipe.ingredients
        : [{ name: "", quantity: "", optional: false }]
    );

    setSteps(
      recipe.steps?.length ? recipe.steps : [{ instruction: "", time: "" }]
    );

    setTags(recipe.tags?.length ? recipe.tags : []);

    setPreview(recipe.image || null);
    setImage(null); // reset image unless user uploads new
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;

    try {
      const res = await axios.delete(`${base_url}/recipes/re/delete/${id}`, {
        withCredentials: true
      });
      console.log("Recipe deleted", res.data);
      fetchRecipes();
    } catch (err) {
      console.error("Error in delete recipe", err);
    }
  };

  const handleRecipe = (recipeId) => {
    if (!recipeId) return;
    navigate(`/dashboard/${recipeId}`);
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex flex-row justify-between items-center mb-5">
        <h1 className="text-xl font-semibold mb-4">🍳 Manage Your Recipes</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1 rounded cursor-pointer bg-green-600 shadow-lg text-white hover:bg-green-700 transition-all duration-200"
        >
          Add New+
        </button>
      </div>

      {/* ---------------- FORM ---------------- */}
      {open && (
        <div className="fixed inset-0 bg-[#000000f0] p-4 pt-10 z-80 overflow-y-auto">
          <div className="w-full min-h-full flex items-start justify-center">
            <div className="text-white w-5xl  ">
              <p
                onClick={() => resetForm()}
                className="w-10 text-3xl cursor-pointer hover:text-[#6a6a6a] duration-300 absolute top-5 right-5"
              >
                x
              </p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 border p-4 rounded-xl mb-6 "
              >
                <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
                  <input
                    name="title"
                    placeholder="Recipe title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="border p-2 rounded"
                  />

                  <input
                    name="cuisine"
                    placeholder="Cuisine (Indian, Italian...)"
                    value={form.cuisine}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="calories"
                    placeholder="calories"
                    value={form.calories}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />
                  <input
                    name="costEstimate"
                    placeholder="costEstimate"
                    value={form.costEstimate}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />

                  <input
                    name="cookingTime"
                    type="number"
                    placeholder="Cooking time (min)"
                    value={form.cookingTime}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  />

                  <select
                    name="dietType"
                    value={form.dietType}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  >
                    <option value="Any">Any</option>
                    <option value="Veg">Veg</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>

                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className="border p-2 rounded"
                  >
                    {/* <option value="Any">Any</option> */}
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="flex flex-row gap-5">
                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold">Cooking Steps</h3>

                    {steps.map((step, index) => (
                      <div key={index} className="flex gap-2">
                        {/* Step number (display only) */}
                        <span className="font-medium w-6 text-center">
                          {index + 1}.
                        </span>

                        <input
                          placeholder="Instruction"
                          value={step.instruction}
                          onChange={(e) =>
                            updateStep(index, "instruction", e.target.value)
                          }
                          className="border p-2 rounded w-full"
                        />

                        <input
                          type="number"
                          placeholder="min"
                          value={step.time}
                          onChange={(e) =>
                            updateStep(index, "time", e.target.value)
                          }
                          className="border p-2 rounded w-20"
                        />

                        <button
                          onClick={() => removeStep(index)}
                          className="text-red-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addStep}
                      className="text-green-600 text-sm cursor-pointer "
                    >
                      + Add Step
                    </button>
                  </div>

                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold">Ingredients</h3>

                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          placeholder="Ingredient"
                          value={ing.name}
                          onChange={(e) =>
                            updateIngredient(index, "name", e.target.value)
                          }
                          className="border p-2 rounded w-1/3"
                        />

                        <input
                          placeholder="Quantity"
                          value={ing.quantity}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", e.target.value)
                          }
                          className="border p-2 rounded w-1/3"
                        />

                        <input
                          type="checkbox"
                          checked={ing.optional}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              "optional",
                              e.target.checked
                            )
                          }
                        />

                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-red-600 cursor-pointer "
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-green-600 text-sm cursor-pointer"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                </div>

                <div className="flex flex-row gap-5">
                  <div className="space-y-3 flex-1">
                    <label className="text-sm font-medium text-gray-200">
                      Recipe Image
                    </label>

                    <div className="flex items-center gap-4">
                      {/* Upload Button */}
                      <label className="cursor-pointer flex flex-col items-center justify-center h-32 w-32 rounded-xl border-2 border-dashed border-gray-500 hover:border-green-500 hover:bg-green-500/10 transition duration-300 text-gray-300">
                        <span className="text-xs">Click to upload</span>
                        <span className="text-[10px] text-gray-400">
                          PNG, JPG
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {/* Preview */}
                      {preview && (
                        <div className="relative">
                          <img
                            src={preview}
                            alt="preview"
                            className="h-32 w-32 object-cover rounded-xl border"
                          />
                          <button
                            type="button"
                            onClick={() => setPreview(null)}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 relative">
                    <h3 className="font-semibold">Tags</h3>

                    <div className="flex flex-wrap gap-2 border rounded-lg p-2 min-h-[48px]">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-xs cursor-pointer hover:text-[#313131] duration-300"
                          >
                            ✕
                          </button>
                        </span>
                      ))}

                      <input
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setActiveIndex(-1);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type & press Enter"
                        className="flex-1 min-w-[120px] bg-transparent outline-none p-1"
                      />
                    </div>

                    {/* Autocomplete */}
                    {tagInput && filteredSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full bg-black border rounded-lg mt-1 max-h-40 overflow-auto">
                        {filteredSuggestions.map((tag, index) => (
                          <div
                            key={tag}
                            onClick={() => addTag(tag)}
                            className={`p-2 cursor-pointer ${
                              index === activeIndex
                                ? "bg-green-600 text-white"
                                : "hover:bg-gray-700"
                            }`}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  name="description"
                  placeholder="Short description"
                  value={form.description}
                  onChange={handleChange}
                  className="border p-2 rounded col-span-full"
                />

                <div className="flex gap-2 col-span-full">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-600 text-white rounded cursor-pointer"
                  >
                    {isLoading && (
                      <i className="fa-solid fa-spinner fa-spin-pulse mr-2"></i>
                    )}
                    {editingRecipe ? "Update Recipe" : "Add Recipe"}
                  </button>

                  {editingRecipe && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2 text-black cursor-pointer bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- RECIPE LIST ---------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe._id}
            className="relative bg-[#cacaca] shadow-md rounded-xl p-4 flex justify-between"
          >
            {/* LEFT */}
            <div className="flex gap-4">
              <img
                onClick={() => handleRecipe(recipe._id)}
                className="w-24 h-24 object-cover cursor-pointer hover:scale-95 duration-300 rounded-lg"
                src={recipe.image}
                alt="recipe"
              />

              <div className="flex flex-col gap-1">
                <h2
                  onClick={() => handleRecipe(recipe._id)}
                  className="font-semibold cursor-pointer hover:text-[#383838]"
                >
                  {recipe.title}
                </h2>

                <p className="text-sm text-gray-600">
                  {recipe.metadata?.cuisine} • {recipe.metadata?.cookingTime}{" "}
                  min
                </p>
              </div>
            </div>

            {/* MENU ICON */}
            <div
              onClick={() =>
                setOpenMenuId(openMenuId === recipe._id ? null : recipe._id)
              }
              className="hover:bg-[#aaa9a9] duration-300 h-fit rounded-full cursor-pointer"
            >
              <i className="fa-solid fa-ellipsis-vertical px-4 py-2"></i>
            </div>

            {/* DROPDOWN */}
            {openMenuId === recipe._id && (
              <div className="absolute top-14 right-4 bg-[#aaa9a9] shadow-lg rounded-lg z-20">
                <button
                  onClick={() => {
                    handleEdit(recipe);
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-[#676767] text-white rounded-lg duration-200 cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    handleDelete(recipe._id);
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-[#676767] text-red-600 rounded-lg duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRecipeManager;
