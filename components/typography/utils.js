

export const clampWords = (str ="", n) => {
    if (str.split(" ").length <= n)
        return str;
    return str.split(" ", n).join(" ") + "...";
};