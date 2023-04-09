import matplotlib.pyplot as plt
import mpld3

# Create a simple line plot
x = [1, 2, 3, 4, 5]
y = [1, 4, 9, 16, 25]
plt.plot(x, y)

# Convert the plot to HTML using mpld3
html = mpld3.fig_to_html(plt.gcf())

# Print the HTML code
print(html)
